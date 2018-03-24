const path = require("path"); 
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');  
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {    
    context: __dirname, 

    entry:{ 
        'randomDatabase':'./randomDatabase.ts'
    }, 

    output:{              
        filename : '[name].js' ,
        path : path.resolve(__dirname)
    }, 

    resolve:{ 
        extensions: [".ts", ".tsx", ".js", ".json"]
    },  

    module:{
        rules: [ 
          {  
            test:/\.(ts|tsx)?$/,  
            exclude:  [
                path.resolve(__dirname,'node_modules')
            ], 
            loader:"awesome-typescript-loader"
          }   
        ]    
    },
  
    plugins:[ 
        new CopyWebpackPlugin([{from : './words'}]),
        new CleanWebpackPlugin(['./randomDatabase.js']),
    ], 

    target: 'node',

    node: {
        __dirname: false,
        __filename: false
    }
};
  