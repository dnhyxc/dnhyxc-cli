// @ts-ignore
import downloadGitRepo from 'download-git-repo';
import ora from 'ora';
import chalk from 'chalk';

// 从git上拉取模板
export const create = async (remote: string, name: string, option = false) => {
  const spinner = ora(`正在拉取${ remote }...`).start();
  return new Promise((resolve, reject) => {
    downloadGitRepo(remote, name, option, (err: Error) => {
      if (err) {
        spinner.fail(chalk.red(err));
        reject(err);
      }
      spinner.succeed(chalk.green('拉取成功'));
      resolve(1);
    });
  });
};
