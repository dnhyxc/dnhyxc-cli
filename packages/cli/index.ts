#!/usr/bin/env node
import path from 'path';
import fs from 'fs-extra';
import ora from 'ora';
import chalk from 'chalk';
import { program } from 'commander';
import { templates } from '@/constants';
import { beautyLog, inquirerChoose, inquirerConfirm, removeDir } from '@/utils';
import { getProjectList } from '@/server';
import { create, install } from '@/index';
import pkg from './package.json';

// 从git上获取项目列表
const getProjects = async (name: string) => {
  const spinner = ora(`正在获取模版...`).start();
  const res = await getProjectList();
  if (res.status === 200) {
    spinner.succeed(chalk.green('拉取成功'));
    return res.data.map((i: any) => i[name]);
  } else {
    spinner.fail(chalk.red('无法获取模版，暂时使用默认模版'));
    return templates;
  }
};

const getProjectsNoMsg = async (name: string) => {
  const res = await getProjectList();
  if (res.status === 200) {
    return res.data.map((i: any) => i[name]);
  } else {
    return templates;
  }
};

program.version(pkg.version, '-v, --version');

program
  .name("dnhyxc-cli")
  .description("自定义脚手架")
  .usage("<command> [options]")
  .on('--help', () => {
    console.log(`\r\nRun ${ chalk.cyan(`dnhyxc-cli <command> --help`) } for detailed usage of given command\r\n`);
  });

program
  .command('list')
  .description('查看所有可用模板')
  .action(async () => {
    const projectList = await getProjects('name');
    console.log(chalk.yellowBright(beautyLog.star, '模板列表'));
    projectList.forEach((project: string[], index: number) => {
      console.log(`(${ index + 1 }) ${ project }`);
    });
  });

const programCreateCallback = async (name: string, option: { force: boolean, template: string, ignore: boolean }) => {
  const pattern = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>《》/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]");
  // 存放拉取代码的目录
  const projectPath = path.join(process.cwd(), name);
  // 选择的模版
  let repository = '';

  // 验证name输入是否合法
  if (pattern.test(name)) {
    console.log(beautyLog.error, "项目名称存在非法字符，请重新输入");
    return;
  }

  // 验证name是否存在
  if (fs.existsSync(projectPath) && !option.force) {
    const answer = await inquirerConfirm(`是否删除${ chalk.yellow(name) }文件夹？`);
    if (answer.confirm) {
      await removeDir(projectPath);
    } else {
      console.log(beautyLog.error, chalk.redBright(`存在同名文件夹：“${ chalk.yellowBright(name) }”，无法创建项目`));
      return;
    }
  } else if (fs.existsSync(projectPath) && option.force) {
    console.log(beautyLog.warning, `存在相同项目文件夹${ chalk.yellowBright(name) }，正在强制删除`);
    await removeDir(name);
  }
  const projectList = await getProjectsNoMsg('full_name');
  if (option.template) {
    const template = projectList.find((template: string) => template === `dnhyxc/${ option.template }`);
    if (!template) {
      console.log(beautyLog.error, `不存在模板 ${ chalk.yellow(option.template) }`);
      console.log(`\r\n运行${ beautyLog.arrow } ${ chalk.cyan(`dnhyxc-cli list`) } 查看所有可用模板\r\n`);
      return;
    }
    repository = template;
  } else {
    // 选择远程git项目模板
    const answer = await inquirerChoose('请选择项目模板:', projectList);
    repository = answer.choose;
  }
  await create(repository, projectPath);

  if (fs.existsSync(`${ projectPath }/package.json`)) {
    await install(projectPath, name);
  }
};

program
  .command('create <app-name>')
  .description('创建新项目')
  .option('-t, --template [template]', '输入模板名称创建项目')
  .option('-f, --force', '强制覆盖本地同名项目')
  .option('-i, --ignore', '忽略项目相关描述,快速创建项目')
  .action(programCreateCallback);

// 必须写在所有的 program 语句之后，否则上述 program 语句不会执行
program.parse(process.argv);