var path = require("path");
var HtmlWebpackPlugin = require('html-webpack-plugin');
var webpack = require('webpack');
const webpackTargetElectronRenderer = require('webpack-target-electron-renderer');   
var CopyWebpackPlugin = require('copy-webpack-plugin');    
   
module.exports = {     
    context: __dirname + "/app",
    
    entry: {     
        'app':'./app.tsx',
        'quickentry':'./quickentry.tsx',
        'notification':'./notification.tsx'
    },  

    output: {            
        filename : '[name].js' , 
        path : path.resolve(__dirname,"dist") 
    },     
     
    resolve: { 
        extensions: [".ts", ".tsx", ".js", ".json", ".css"]
    }, 
                  
    module: { 
        rules: [ 
          {   
            test: /\.(css|scss)$/,   
            use: [ 'style-loader', 'css-loader']
          },  
          {  
            test:/\.(ts|tsx)?$/,  
            exclude: [
                path.resolve(__dirname,'production'),
                path.resolve(__dirname,'node_modules')
            ], 
            loader:"awesome-typescript-loader"
          },      
          {
            test: /\.(woff|woff2|eot|ttf|svg)$/,
            loader: 'file-loader?name=fonts/[name].[ext]'
          },  
          {      
            enforce:"pre",  
            test:/\.js$/,       
            exclude: [
                path.resolve(__dirname,'production'),
                path.resolve(__dirname,'node_modules')
            ], 
            loader: 'babel-loader',
            query: {presets: ['es2015', 'react']}  
          }     
        ]    
    },
    
    target:'electron', 

    devtool: 'sourcemap', 
        
    plugins :[
        new CopyWebpackPlugin([{from : './assets'}]),   
        new HtmlWebpackPlugin({
            inject:true, 
            title:'tasklist',     
            chunks:['app'],
            filename: 'app.html' 
        }),
        new HtmlWebpackPlugin({
            inject:true, 
            title:'Quick Entry',     
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
};
 
   