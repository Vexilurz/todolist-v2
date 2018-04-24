const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');      
const CleanWebpackPlugin = require('clean-webpack-plugin');   
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

module.exports = {     

    mode:'development',
    
    entry:{    
        'worker':'./app/worker.ts',
    },  

    output:{             
        filename:'[name].js', 
        path:path.resolve(__dirname,"dist") 
    },     
     
    resolve: { 
        extensions: [".ts",".tsx", ".js"]
    }, 
                   
    module: { 
        rules: [ 
          {  
            test:/\.(ts|tsx)?$/,  
            exclude:/(node_modules|production)/, 
            loader:"awesome-typescript-loader"
          }, 
          {     
            test: /\.js$/,
            exclude: /(node_modules|production)/,
            loader: 'babel-loader',
            options: {
              presets: ['env']
            },
          },   
        ]    
    }, 
    
    target: "web",     
        
    plugins : [
        new webpack.DefinePlugin({
            NODE_ENV: JSON.stringify('development')
        })   
    ],  

    node: { 
        __dirname: false, 
        __filename: false
    }       
};
 
   