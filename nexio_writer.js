const fs = require('fs');
const path = require('path');

const BASE = 'C:/Users/atezm/projets/nexio';

function writeFile(relPath, content) {
  const full = path.join(BASE, relPath);
  const dir = path.dirname(full);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('Written:', relPath);
}

// ─── 1. BACKUP OFFSITE ────────────────────────────────────
writeFile('backend/src/services/backupOffsite.js', `'use strict';

const { execSync } = require('child_process');
const path = require('path');
const fss = require('fs');
const crypto = require('crypto');
const logger = require('./logger');

const BACKUP_REMOTE_HOST = process.env.BACKUP_REMOTE_HOST || 'atz.septentrionsports.org';
const BACKUP_REMOTE_USER = process.env.BACKUP_REMOTE_USER || 'u737268845';
const BACKUP_REMOTE_PASS = process.env.BACKUP_REMOTE_PASS || '';
const BACKUP_REMOTE_PORT = parseInt(process.env.BACKUP_REMOTE_PORT) || 21;
const BACKUP_REMOTE_BASE = process.env.BACKUP_REMOTE_PATH || '/home/u737268845/domains/atz.septentrionsports.org/backup_nexio';
const BACKUP_ENCRYPT_KEY = process.env.BACKUP_ENCRYPT_KEY || process.env.JWT_SECRET || 'nexio-backup-key-change-me';
const LOCAL_TMP = path.join(__dirname, '..', '..', 'backups', 'offsite-tmp');
const MAX_REMOTE_BACKUPS = parseInt(process.env.MAX_REMOTE_BACKUPS) || 7;

function ensureDir(dir) {
  if (!fss.existsSync(dir)) fss.mkdirSync(dir, { recursive: true });
}

function stamp() {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

function encryptFile(inputPath, outputPath) {
  const key = crypto.scryptSync(BACKUP_ENCRYPT_KEY, 'nexio-salt', 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  const input = fss.readFileSync(inputPath);
  const encrypted = Buffer.concat([iv, cipher.update(input), cipher.final()]);
  fss.writeFileSync(outputPath, encrypted);
  return fss.statSync(outputPath).size;
}

function decryptFile(inputPath, outputPath) {
  const key = crypto.scryptSync(BACKUP_ENCRYPT_KEY, 'nexio-salt', 32);
  const encrypted = fss.readFileSync(inputPath);
  const iv = encrypted.subarray(0, 16);
  const data = encrypted.subarray(16);
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
  fss.writeFileSync(outputPath, decrypted);
}

function dumpDatabase(outputPath) {
  const h = process.env.DB_HOST || 'localhost';
  const p = process.env.DB_PORT || '5432';
  const d = process.env.DB_NAME || 'nexio_db';
  const u = process.env.DB_USER || 'nexio_user';
  const pw = process.env.DB_PASSWORD || '';
  execSync('PGPASSWORD="' + pw + '" pg_dump -h ' + h + ' -p ' + p + ' -U ' + u + ' --no-owner --no-acl ' + d + ' | gzip > "' + outputPath + '"', { stdio: 'pipe', timeout: 300000 });
  return fss.statSync(outputPath).size;
}

function archiveDirectory(sourceDir, outputPath, excludes) {
  if (!fss.existsSync(sourceDir)) {
    logger.warn('Backup: dossier source inexistant', { sourceDir });
    return 0;
  }
  const ef = (excludes || []).map(function(e) { return "--exclude='" + e + "'"; }).join(' ');
  execSync('tar czf "' + outputPath + '" ' + ef + ' -C "' + path.dirname(sourceDir) + '" "' + path.basename(sourceDir) + '"', { stdio: 'pipe', timeout: 300000 });
  return fss.statSync(outputPath).size;
}

function uploadViaFtp(localFiles, remoteDir) {
  if (!BACKUP_REMOTE_PASS) {
    throw new Error('BACKUP_REMOTE_PASS non configure');
  }

  var cmds = [
    'open -u ' + BACKUP_REMOTE_USER + ',' + BACKUP_REMOTE_PASS + ' -p ' + BACKUP_REMOTE_PORT + ' ftp://' + BACKUP_REMOTE_HOST,
    'set ssl:verify-certificate no',
    'set net:timeout 30',
    'set net:max-retries 3',
    'mkdir -p ' + remoteDir + '/database',
    'mkdir -p ' + remoteDir + '/backend',
    'mkdir -p ' + remoteDir + '/frontend',
  ];

  localFiles.forEach(function(f) {
    cmds.push('put "' + f.localPath + '" -o "' + f.remotePath + '"');
  });
  cmds.push('bye');

  var scriptPath = path.join(LOCAL_TMP, 'lftp-cmd.txt');
  fss.writeFileSync(scriptPath, cmds.join('\n'));

  try {
    execSync('lftp -f "' + scriptPath + '"', { stdio: 'pipe', timeout: 600000 });
    return true;
  } finally {
    try { fss.unlinkSync(scriptPath); } catch(e) {}
  }
}

function rotateRemoteBackups(remoteDir, subdir) {
  if (!BACKUP_REMOTE_PASS) return;
  try {
    var script = [
      'open -u ' + BACKUP_REMOTE_USER + ',' + BACKUP_REMOTE_PASS + ' -p ' + BACKUP_REMOTE_PORT + ' ftp://' + BACKUP_REMOTE_HOST,
      'set ssl:verify-certificate no',
      'cls -1 --sort=date ' + remoteDir + '/' + subdir + '/',
      'bye',
    ].join('\n');

    var scriptPath = path.join(LOCAL_TMP, 'rotate-' + subdir + '.txt');
    fss.writeFileSync(scriptPath, script);
    var output = execSync('lftp -f "' + scriptPath + '"', { encoding: 'utf-8', timeout: 30000 }).trim();
    try { fss.unlinkSync(scriptPath); } catch(e) {}

    var files = output.split('\n').filter(function(f) { return f.endsWith('.enc'); });
    if (files.length > MAX_REMOTE_BACKUPS) {
      var toDelete = files.slice(MAX_REMOTE_BACKUPS);
      var delCmds = [
        'open -u ' + BACKUP_REMOTE_USER + ',' + BACKUP_REMOTE_PASS + ' -p ' + BACKUP_REMOTE_PORT + ' ftp://' + BACKUP_REMOTE_HOST,
        'set ssl:verify-certificate no',
      ];
      toDelete.forEach(function(f) { delCmds.push('rm ' + remoteDir + '/' + subdir + '/' + f); });
      delCmds.push('bye');
      var delPath = path.join(LOCAL_TMP, 'del-' + subdir + '.txt');
      fss.writeFileSync(delPath, delCmds.join('\n'));
      execSync('lftp -f "' + delPath + '"', { stdio: 'pipe', timeout: 30000 });
      try { fss.unlinkSync(delPath); } catch(e) {}
      logger.info('Backup rotation distante', { subdir: subdir, deleted: toDelete.length });
    }
  } catch (err) {
    logger.warn('Rotation distante echouee', { subdir: subdir, error: err.message });
  }
}

async function runOffsiteBackup() {
  var t = stamp();
  ensureDir(LOCAL_TMP);

  var results = { timestamp: t, files: [], errors: [] };
  var filesToUpload = [];

  // 1. DATABASE
  try {
    var dumpPath = path.join(LOCAL_TMP, 'db_' + t + '.sql.gz');
    var encPath = path.join(LOCAL_TMP, 'db_' + t + '.sql.gz.enc');
    dumpDatabase(dumpPath);
    var encSize = encryptFile(dumpPath, encPath);
    fss.unlinkSync(dumpPath);
    filesToUpload.push({ localPath: encPath, remotePath: BACKUP_REMOTE_BASE + '/database/db_' + t + '.sql.gz.enc' });
    results.files.push({ type: 'database', size: encSize, file: 'db_' + t + '.sql.gz.enc' });
    logger.info('Backup BDD pret', { size: (encSize / 1024 / 1024).toFixed(2) + ' MB' });
  } catch (err) {
    results.errors.push({ type: 'database', error: err.message });
    logger.error('Backup BDD echoue', { error: err.message });
  }

  // 2. BACKEND
  try {
    var backendSrc = path.join(__dirname, '..');
    var archPath = path.join(LOCAL_TMP, 'backend_' + t + '
