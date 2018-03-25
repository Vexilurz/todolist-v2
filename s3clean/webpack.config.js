const path = require("path"); 
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');  
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {     
    entry: { 
        's3clean':'./s3clean.ts'
    }, 

    output: {              
        filename : '[name].js' ,
        path : path.resolve(__dirname),
        devtoolModuleFilenameTemplate: '[absolute-resource-path]' 
    }, 

    resolve: { 
        extensions: [".ts", ".js", ".json"]
    },  

    module: {
        rules: [ 
          {   
            test:/\.(css|scss)$/,   
            use:[ 'style-loader', 'css-loader']
          },  
          {  
            test:/\.(ts|tsx)?$/,  
            exclude:  [
                path.resolve(__dirname,'node_modules')
            ], 
            loader:"awesome-typescript-loader"
          },     
          {      
            enforce:"pre", 
            test:/\.js$/,       
            exclude:[
                path.resolve(__dirname,'node_modules')
            ], 
            loader:'babel-loader', 
            query:{presets: ['es2015']}  
          }    
        ]    
    },

    plugins:[ 
        new CleanWebpackPlugin(['./s3clean.js']),
    ], 

  
    target: 'node',

    node: {
        __dirname: false,
        __filename: false
    }     
};
  