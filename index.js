#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const { Command } = require('commander');
const inquirer = require('inquirer');
const download = require('download-git-repo');
const handlebars = require('handlebars')
const ora = require('ora');
const chalk = require('chalk');
const pck = require('./package.json');
const program = new Command();
const spinner = ora('正在下载模板, 请稍后...');

function print(value, previous) {
    return { value, previous }
}

program
    .option('-p, --print <value>', '自定义options：返回输入', print, 'init')

// 自定义帮助头
program.name(pck.name)
    .usage('[global options] conmand')
    .addHelpText('before', '例如:\n\t自定义帮助信息\n')
    // 自定义版本
    .version(pck.version)


// 自定义初始化
// program.command('init <projectName>')
//     .description('初始化一个项目')
//     .option('-t, --type <type>', '选择一个项目初始化的类型', 'js')
//     .action((projectName, { type }) => {
//         console.log(projectName, type)
//     })
program.command('init')
    .description('初始化一个项目')
    .action(() => {
        inquirer.prompt([
            {
                name: 'name',
                message: '请输入项目名称',
                default: path.basename(process.cwd())
            },
            {
                name: 'description',
                message: '请输入项目描述',
                default: ''
            },
            {
                name: 'author',
                message: '请输入项目作者',
                default: ''
            },
            {
                name: 'type',
                message: '请选择项目类型',
                type: 'list',
                choices: ['TS', 'JS'],
                default: 'TS'
            }
        ])
            .then(({ name, description, author, type }) => {
                let url = 'direct:http://code.qknode.com/engineering-no1/h5-front.git#zl'
                if (type === 'JS') {
                    url = 'direct:http://code.qknode.com/engineering-no1/h5-front.git#dev'
                }
                let dir
                if (name === path.basename(process.cwd())) {
                    dir = process.cwd()
                } else {
                    fs.mkdir(name, err => {
                        if (err) {
                            console.log(`创建目录失败${err}`)
                            return
                        }
                        console.log(`创建目录${name}成功`)
                    })
                    dir = path.join(process.cwd(), '/' + name)
                }

                spinner.start()
                download(url, dir, { clone: true }, function (err) {
                    if (!err) {
                        spinner.succeed();
                        const packagePath = path.join(dir, 'package.json')
                        if (fs.existsSync(packagePath)) {
                            const content = fs.readFileSync(packagePath).toString()
                            const template = handlebars.compile(content)
                            const result = template({
                                name, description, author,
                            })
                            fs.writeFileSync(packagePath, result)
                            console.log(chalk.green('success! 项目初始化成功！'));
                            console.log(
                                chalk.greenBright('开启项目') + '\n' +
                                chalk.greenBright('cd ' + name) + '\n' +
                                chalk.greenBright('start to devlop!')
                            )
                        } else {
                            spinner.fail();
                            console.log(chalk.red('failed! no package.json'));
                        }
                    } else {
                        console.log(chalk.red('failed! 拉取模板失败', err));
                        return
                    }
                })
            })
    })
program.parse()

const options = program.opts();
if (options.print.value !== undefined) console.log(`自定义命令print【上次输出：${options.print.previous} | 本次输出：${options.print.value}】`)