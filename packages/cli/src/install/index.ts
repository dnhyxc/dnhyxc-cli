import { exec } from 'child_process';
import ora from 'ora';
import chalk from 'chalk';
import { beautyLog, getExecScript } from '../utils';

// 自动安装依赖
export const install = async (projectPath: string, projectName: string) => {
  const spinner = ora('正在下载依赖...').start();
  return new Promise((resolve, reject) => {
    const execScript = getExecScript(projectPath);
    exec(`cd ${ projectPath } && ${ execScript }`, (error, stdout, stderr) => {
      if (error) {
        console.error(`${ error.message }`);
        spinner.fail(chalk.red(`执行${ execScript }自动下载依赖失败，请 cd ${ projectName }，手动安装依赖`));
        reject(error);
        return;
      }
      spinner.succeed(chalk.green('依赖下载完成'));
      const pkg = require(`${ projectPath }/package.json`);
      console.log(beautyLog.info, chalk.green(`cd ${ projectName }`));
      if (pkg.scripts.dev || pkg.scripts.start || pkg.scripts.serve) {
        const script = {
          [pkg.scripts.dev]: 'npm run dev',
          [pkg.scripts.start]: 'npm start',
          [pkg.scripts.serve]: 'npm run serve',
        };
        console.log(beautyLog.info, chalk.green(`运行 ${ script[pkg.scripts.dev] || script[pkg.scripts.start] || script[pkg.scripts.serve] } 启动项目`));
      }
      resolve(1);
    });
  });
};
