const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');      
const {CleanWebpackPlugin} = require('clean-webpack-plugin');   
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

module.exports = [
    {
        context: __dirname + "/app",
        entry:{    
            'pouchWorker':'./database/pouchWorker.ts'
        },
        mode:'development',
        target: 'webworker', 
        devtool: 'cheap-module-source-map', // 'source-map',
        resolve: { 
            extensions: [".ts", ".tsx", ".js", ".json"]
        }, 
        module: { 
            rules: [ 
                {  
                    test:/\.(ts|tsx)?$/,  
                    exclude: /(node_modules)/, 
                    loader:"ts-loader"
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
        output:{             
            filename:'[name].js', 
            path:path.resolve(__dirname,"dist") 
        }
    },
    {
        context: __dirname + "/app",
        entry:{    
            'generateIndicators':'./generateIndicators.ts'
        },
        mode:'development',
        target: 'webworker',
        devtool: 'cheap-module-source-map', // 'source-map',
        resolve: { 
            extensions: [".ts", ".tsx", ".js", ".json"]
        }, 
        module: { 
            rules: [ 
                {  
                    test:/\.(ts|tsx)?$/,  
                    exclude: /(node_modules)/, 
                    loader:"ts-loader"
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
        output:{             
            filename:'[name].js', 
            path:path.resolve(__dirname,"dist") 
        }
    },
    {     
        context: __dirname + "/app",

        mode:'development',
         
        entry:{    
            'app':'./app.tsx',
            'quickentry':'./quickentry.tsx',
            'notification':'./notification.tsx'
        },  

        output:{             
            filename:'[name].js', 
            path:path.resolve(__dirname,"dist") 
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
];
 
   