const path = require("path"); 
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');  
const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {     
    mode:'development',

    entry: { 
        'main':'./app.ts',    
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
          } 
        ]    
    },
 
    devtool: 'source-map',

    target: "node",     

    plugins:[ 
        new CleanWebpackPlugin(['dist']),
        new webpack.DefinePlugin({
            NODE_ENV: JSON.stringify('development')
        })
    ], 

    node:{ 
        __dirname: false, 
        __filename: false
    }       
};
  