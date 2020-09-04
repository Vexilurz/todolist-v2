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
    return {

        context: path.join(__dirname, "app"),

        target: "electron-renderer",

        resolve: {
            extensions: [".js", ".jsx", ".ts", ".tsx", ".json"]
        },

        mode: isDev ? DEVELOPMENT : PRODUCTION,

        devtool: isDev ? "source-map" : "none",

        entry: {
            "polyfill": "@babel/polyfill",
            'app':'./app.tsx',
            'quickentry':'./quickentry.tsx',
            'notification':'./notification.tsx'
        },

        output: {
            filename: isDev ? "[name].js" : "[name].[hash].js",
            path: path.join(__dirname, "dist")
        },

        externals: {
            "react": "React",
            "react-dom": "ReactDOM",
            "react-router-dom": "ReactRouterDOM",
            "fs": "require('fs')" // we must add node native functions as externals to be able to use them. see ./src/views/FooView.tsx.
        },

        module: {
            rules: [

                {
                    test: /\.(css|scss)$/,
                    exclude: /node_modules\/(?!(draft-js)\/).*/,  
                    use: [
                        // {
                        //     loader: MiniCssExtractPlugin.loader,
                        //     options: {
                        //         hmr: isDev
                        //     }
                        // },
                        "css-loader",
                        "sass-loader"
                    ]
                },
                {   
                    test   : /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9=&.]+)?$/,
                    exclude: /(node_modules)/, 
                    loader: 'file-loader'  
                }, 
                {
                    test: /\.(js|jsx|ts|tsx)$/,
                    exclude: /node_modules/,
                    use: {
                        loader: "babel-loader",
                        options: {
                            presets: [
                                "@babel/preset-typescript",
                                "@babel/preset-react",
                                "@babel/preset-env"
                            ],
                            plugins: [
                                ["@babel/plugin-proposal-decorators", { "legacy": true }],
                                ["@babel/plugin-proposal-class-properties"]
                                
                            ]
                        }
                    }
                },

            ]
        },

        plugins: [

            new CleanWebpackPlugin({
                cleanOnceBeforeBuildPatterns: ["!main.*.js"] // config for electron-main deletes this file
            }),

            // new MiniCssExtractPlugin({
            //     filename: "main.css"
            // }),

            // new CopyWebpackPlugin(
            //     {
            //         patterns: [ 
            //             // {
            //             //     from: './assets',
            //             //     to: './dist',
            //             // },
            //             // {from : 'config.json', to: '/dist'}
                        
            //         ],
            //     }
            //    ), 

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
            }),

            new HtmlExternalsPlugin({
                cwpOptions: { context: path.join(__dirname, "node_modules") },
                externals: [
                    {
                        module: "react",
                        global: "React",
                        entry: isDev ? "umd/react.development.js" : "umd/react.production.min.js"
                    },
                    {
                        module: "react-dom",
                        global: "ReactDOM",
                        entry: isDev ? "umd/react-dom.development.js" : "umd/react-dom.production.min.js"
                    },
                    {
                        module: "react-router-dom",
                        global: "ReactRouterDOM",
                        entry: isDev ? "umd/react-router-dom.js" : "umd/react-router-dom.min.js"
                    },
                ]
            }),

        ],

        devServer: isDev ? {
            contentBase: path.join(__dirname, "dist"),
            compress: true,
            hot: true,
            port: 9000
        } : undefined
    };
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
            path: path.join(__dirname, "dist")
        },

        module: {
            rules: [
                {
                    test:/\.(ts|tsx)?$/,  
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
                    {from: "package.json", to: "./", context:"../"},
                    {from: "app/assets", to: "./", context:"../"}
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

        node:{ 
            __dirname: false, 
            __filename:false
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
