/* eslint-disable no-unused-vars */
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import scss from 'rollup-plugin-scss';
import path from 'path';
import rimraf from 'rimraf';
import glob from 'glob';
import fsExtra from 'fs-extra';
import { getBabelOutputPlugin } from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';
const config = {
    outputDir: 'dist',
    sourceDir: 'src',
};
export default new Promise((resolve, reject) => {
    // 删除输出目录
    rimraf(path.resolve(config.outputDir), {}, (err) => {
        if (!err) {
            resolve();
        }
    });
})
    .then(() => {
        return new Promise((resolve, reject) => {
            glob(
                `${config.sourceDir}/**/**(.scss|.d.ts)`,
                {},
                function (er, files) {
                    if (!er) {
                        resolve(files);
                    }
                }
            );
        }).then((files) => {
            files.forEach((filepath) => {
                console.log(
                    filepath,
                    path.resolve(
                        filepath.replace(config.sourceDir, config.outputDir)
                    )
                );
                fsExtra.copySync(
                    path.resolve(filepath),
                    path.resolve(
                        filepath.replace(config.sourceDir, config.outputDir)
                    )
                );
            });
        });
    })
    .then(() => {
        return {
            input: './src/index.js',
            // 输出两种模式
            output: [
                {
                    file: `${config.outputDir}/index.es.js`,
                    format: 'es',
                },
                {
                    file: `${config.outputDir}/index.js`,
                    format: 'cjs',
                    // hoistTransitiveImports: false,
                    plugins: [
                        // 编译
                        getBabelOutputPlugin({
                            presets: [
                                [
                                    '@babel/preset-env',
                                    {
                                        targets: {
                                            chrome: '58',
                                            ie: '9',
                                        },
                                    },
                                ],
                            ],
                            extensions: ['.jsx', '.js'],
                        }),
                        terser(),
                    ],
                },
            ],
            // 这类模块不编译
            external: ['vue'],
            watch: {
                include: `${config.sourceDir}/**`,
            },
            plugins: [
                resolve(),
                commonjs(),
                // // 将所有的scss编译到一个css文件
                scss({
                    output: `${config.outputDir}/style.css`,
                }),
            ],
        };
    });
