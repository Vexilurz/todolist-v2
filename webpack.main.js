const path = require("path"); 
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');  
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {     
    context: __dirname + "/app",  

    mode:'development',

    entry: { 
        'main':'./main/main.ts',    
    },    
     
    output: {              
        filename : '[name].js' ,
        path : path.resolve(__dirname,"dist")
    },      
 
    resolve: { 
        extensions: [".ts", ".tsx", ".js"]
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
            loader:'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            },
          },
          {   
            test: /\.(css|scss)$/,   
            exclude: /(node_modules)/, 
            use: [ 'style-loader', 'css-loader']
          }    
        ]    
    },
 
    devtool: 'source-map',

    target: "electron-main",     

    plugins:[ 
        new CleanWebpackPlugin({
          cleanAfterEveryBuildPatterns: ['dist']
        }),
        new webpack.DefinePlugin({
            NODE_ENV: JSON.stringify('development')
        })
    ], 

    node:{ 
        __dirname: false, 
        __filename: false
    }       
};
  