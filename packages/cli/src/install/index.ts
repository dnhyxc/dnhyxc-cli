import fs from 'fs-extra';
import { exec } from 'child_process';
import ora from 'ora';
import chalk from 'chalk';
import { beautyLog, getExecScript } from '../utils';

const getScript = (projectName: string, pkg: {
  scripts: { dev: string | number; start: string | number; serve: string | number; };
}) => {
  console.log(beautyLog.info, chalk.green(`cd ${ projectName }`));
  if (pkg.scripts.dev || pkg.scripts.start || pkg.scripts.serve) {
    const script = {
      [pkg.scripts.dev]: 'npm run dev', [pkg.scripts.start]: 'npm start', [pkg.scripts.serve]: 'npm run serve',
    };
    console.log(beautyLog.info, chalk.green(`运行 ${ script[pkg.scripts.dev] || script[pkg.scripts.start] || script[pkg.scripts.serve] } 启动项目`));
  }
};

// 自动安装依赖
export const install = async (projectPath: string, projectName: string) => {
  const spinner = ora('正在下载依赖...\n').start();
  return new Promise(() => {
    const execScript = getExecScript(projectPath);
    exec(`cd ${ projectPath } && ${ execScript }`, (error, stdout, stderr) => {
      console.log(beautyLog.info, `${ stdout }\n`);
      console.log(beautyLog.error, `${ stderr }`);
      const pkg = require(`${ projectPath }/package.json`);
      if (error) {
        const hasNode_modules = fs.existsSync(`${ projectPath }/node_modules`);
        if (hasNode_modules) {
          spinner.fail(chalk.yellow(`执行${ execScript }自动下载依赖存在警告或者报错，请检查项目依赖下载是否有误`));
          getScript(projectName, pkg);
        } else {
          console.log(beautyLog.error, `${ error.message }`);
          spinner.fail(chalk.red(`执行${ execScript }自动下载依赖失败，请 cd ${ projectName }，手动安装依赖`));
        }
      }
      spinner.succeed(chalk.green('依赖下载完成'));
      getScript(projectName, pkg);
    });
  });
};
