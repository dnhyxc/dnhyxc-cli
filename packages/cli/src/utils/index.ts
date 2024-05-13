import path from 'path';
import fs from 'fs-extra';
import ora from 'ora';
import chalk from 'chalk';
import inquirer from 'inquirer';

export { beautyLog } from './beautyLog';

export const getExecScript = (projectPath: string) => {
  // 检查 package-lock.json 是否存在
  const packageLockPath = path.join(projectPath, 'package-lock.json');
  const pnpmLockPath = path.join(projectPath, 'pnpm-lock.yaml');
  const yarnLockPath = path.join(projectPath, 'yarn.lock');

  const hasPackageLock = fs.existsSync(packageLockPath);
  const hasPnpmLock = fs.existsSync(pnpmLockPath);
  const hasYarnLock = fs.existsSync(yarnLockPath);

  if (hasPackageLock && hasPnpmLock && !hasYarnLock) {
    // 如果同时存在 package-lock.json 和 pnpm-lock.yaml，并且不存在 yarn.lock，优先使用 pnpm-lock.yaml
    return 'pnpm install';
  } else if (hasPackageLock && !hasPnpmLock && hasYarnLock) {
    // 如果同时存在 package-lock.json 和 yarn.lock，并且不存在 pnpm-lock.yaml，优先使用 yarn.lock
    return 'yarn';
  } else if (!hasPackageLock && hasPnpmLock && hasYarnLock) {
    // 如果同时存在 pnpm-lock.yaml 和 yarn.lock，并且不存在 package-lock.json，优先使用 pnpm-lock.yaml
    return 'pnpm install';
  } else if (hasPackageLock && !hasPnpmLock && !hasYarnLock) {
    // 只存在 package-lock.json，使用 npm
    return 'npm install';
  } else if (!hasPackageLock && hasPnpmLock && !hasYarnLock) {
    // 只存在 pnpm-lock.yaml，使用 pnpm
    return 'pnpm install';
  } else if (!hasPackageLock && !hasPnpmLock && hasYarnLock) {
    // 只存在 yarn.lock，使用 yarn
    return 'yarn';
  } else {
    // 既没有 package-lock.json，也没有 pnpm-lock.yaml，也没有 yarn.lock，默认使用 npm
    return 'npm install';
  }
};

/**
 * @param {string} message 询问提示语句
 * @returns {boolean} 返回结果
 */
export const inquirerConfirm = (message: string): any => {
  return inquirer.prompt({
    name: 'confirm',
    type: 'confirm',
    message
  });
};

// 删除指定文件夹
export const removeDir = async (dir: string) => {
  const spinner = ora({
    text: `正在删除文件夹${ chalk.cyan(dir) }`,
    color: "yellow",
  }).start();

  try {
    await fs.remove(dir);
    spinner.succeed(chalk.greenBright(`删除文件夹${ chalk.cyan(dir) }成功`));
  } catch (err) {
    console.log(err);
    spinner.fail(chalk.redBright(`删除文件夹${ chalk.cyan(dir) }失败`));
  }
};

/**
 * @param {string} message 询问提示语句
 * @param {Array} choices 选择列表
 * @param {string} type 列表类型
 * @returns {Object} 选择结果
 */
export const inquirerChoose = (message: string, choices: string, type: string = 'list'): any => {
  return inquirer.prompt({
    name: 'choose',
    // @ts-ignore
    type,
    message,
    choices
  });
};
