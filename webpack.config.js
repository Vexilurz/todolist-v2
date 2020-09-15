const path = require("path");
const HtmlPlugin = require("html-webpack-plugin");
const HtmlExternalsPlugin = require("html-webpack-externals-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const DefinePlugin = require("webpack").DefinePlugin;
const CopyWebpackPlugin = require("copy-webpack-plugin");
const webpack = require("webpack");
const HtmlWebpackPlugin = require('html-webpack-plugin');

// const to avoid typos 
const DEVELOPMENT = "development";
const PRODUCTION = "production";

function createRenderConfig(isDev) {
    return [
        {
            context: __dirname + "/app",
            entry: {
                'pouchWorker': './database/pouchWorker.ts'
            },
            mode: isDev ? DEVELOPMENT : PRODUCTION,
            target: 'webworker',
            devtool: 'cheap-module-source-map',
            resolve: {
                extensions: [".ts", ".tsx", ".js", ".json"]
            },
            module: {
                rules: [
                    {
                        test: /\.(ts|tsx)?$/,
                        exclude: /(node_modules)/,
                        loader: "ts-loader"
                    },
                    {
                        test: /\.js$/,
                        exclude: /(node_modules|bower_components)/,
                        loader: 'babel-loader',
                        options: {
                            presets: ['env']
                        },
                    }
                ]
            },
            output: {
                filename: '[name].js',
                path: path.join(__dirname, isDev ? "dist" : PRODUCTION)
            }
        },
        {
            context: __dirname + "/app",
            entry: {
                'generateIndicators': './generateIndicators.ts'
            },
            target: 'webworker',
            devtool: 'cheap-module-source-map', // 'source-map',
            resolve: {
                extensions: [".ts", ".tsx", ".js", ".json"]
            },
            module: {
                rules: [
                    {
                        test: /\.(ts|tsx)?$/,
                        exclude: /(node_modules)/,
                        loader: "ts-loader"
                    },
                    {
                        test: /\.js$/,
                        exclude: /(node_modules|bower_components)/,
                        loader: 'babel-loader',
                        options: {
                            presets: ['env']
                        },
                    }
                ]
            },
            output: {
                filename: '[name].js',
                path: path.join(__dirname, isDev ? "dist" : PRODUCTION)
            }
        }, 
        {
            context: __dirname + "/app",

            mode: isDev ? DEVELOPMENT : PRODUCTION,
             
            entry:{    
                'app':'./app.tsx',
                'quickentry':'./quickentry.tsx',
                'notification':'./notification.tsx'
            },  
    
            output:{             
                filename:'[name].js', 
                path: path.join(__dirname, isDev ? "dist" : PRODUCTION)
            },     
            
            resolve: { 
                extensions: [".ts", ".tsx", ".js", ".json", ".css"]
            }, 
                        
            module: { 
                rules: [ 
                {   
                    test: /\.(css|scss)$/,  
                    exclude: /node_modules\/(?!((draft-js)|(react-tippy))\/).*/,  
                    use: [ 'style-loader', 'css-loader']
                },  
                {  
                    test:/\.(ts|tsx)?$/,  
                    exclude: /(node_modules)/, 
                    loader:"ts-loader"
                },       
                {   
                    test   : /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9=&.]+)?$/,
                    exclude: /(node_modules)/, 
                    loader: 'file-loader'  
                }, 
                {     
                    test: /\.js$/,
                    exclude: /(node_modules|bower_components)/,
                    loader: 'babel-loader',
                    options: {
                    presets: ['env']
                    },
                },   
                ]    
            }, 
    
            devtool: 'cheap-module-source-map', // 'source-map',
            
            target: "electron-renderer",     
            
            plugins : [
                new webpack.DefinePlugin({
                    NODE_ENV: JSON.stringify('development')
                }),
                new CopyWebpackPlugin({
                    patterns: [
                        {from: "app/config.json", to: "./", context:"../"},
                        {from: "app/assets", to: "./", context:"../"}
                    ]
                }),
                new HtmlWebpackPlugin({
                    inject:true, 
                    title:'tasklist',     
                    chunks:['app'],
                    filename: 'app.html' 
                }), 
                new HtmlWebpackPlugin({
                    inject:true, 
                    title:'Add task',     
                    chunks:['quickentry'],
                    filename: 'quickentry.html' 
                }),
                new HtmlWebpackPlugin({
                    inject:true, 
                    title:'Notification',     
                    chunks:['notification'],
                    filename: 'notification.html' 
                })        
            ],  
    
    
            node: { 
                __dirname: false, 
                __filename: false
            }        
        }
    ]
}

function createMainConfig(isDev) {
    return {

        context: path.join(__dirname, "app"),

        target: "electron-main",

        mode: isDev ? DEVELOPMENT : PRODUCTION,

        entry: {
            "main": "./main/main.ts"
        },

        output: {
            filename: "[name].js",
            path: path.join(__dirname,  isDev ? "dist" : PRODUCTION)
        },

        module: {
            rules: [
                {
                    test: /\.(ts|tsx)?$/,
                    exclude: /node_modules/,
                    use: {
                        loader: "babel-loader",
                        options: {
                            presets: [
                                "@babel/preset-typescript",
                                "@babel/preset-env",
                            ],
                            plugins: [
                                ["@babel/plugin-proposal-decorators", { "legacy": true }],
                                ["@babel/plugin-proposal-class-properties"]
                            ]
                        }
                    }
                }
            ]
        },
        resolve: {
            extensions: ['.js', '.ts', '.tsx']
        },

        plugins: [

            new CleanWebpackPlugin({
                cleanOnceBeforeBuildPatterns: ["main.*.js"]
            }),

            // inject this becaus the main process uses different logic for prod and dev.
            new DefinePlugin({
                "ENVIRONMENT": JSON.stringify(isDev ? DEVELOPMENT : PRODUCTION) // this variable name must match the one declared in the main process file.
            }),

            // electron-packager needs the package.json file. the "../" is because context is set to the ./src folder
            new CopyWebpackPlugin({
                patterns: [
                    { from: "package.json", to: "./", context: "../" },
                    { from: "app/assets", to: "./", context: "../" }
                ]
            })
        ],

        externals: {
            "react": "React",
            "react-dom": "ReactDOM",
            "react-router-dom": "ReactRouterDOM",
            "fs": "require('fs')",
            "path": "require('path')"
        },

        node: {
            __dirname: false,
            __filename: false
        }
    };
}



module.exports = function (env) {

    // env variable is passed by webpack through the cli. see package.json scripts.
    const isDev = env.NODE_ENV == DEVELOPMENT;
    const target = env.target;

    const configFactory = target == "main" ? createMainConfig : createRenderConfig;
    const config = configFactory(isDev);

    console.log(
        "\n##\n## BUILDING BUNDLE FOR: " + (target == "main" ? "main" : "app") +
        "\n## CONFIGURATION: " + (isDev ? DEVELOPMENT : PRODUCTION) +
        "\n##\n"
    );

    return config;

};
