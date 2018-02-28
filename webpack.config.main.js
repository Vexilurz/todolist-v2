const path = require("path"); 
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');  
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {     
    context: __dirname + "/app",
    
    entry: { 
        'main':'./main/main.ts'
    }, 

    output: {              
        filename : '[name].js' ,
        path : path.resolve(__dirname,"dist"),
        devtoolModuleFilenameTemplate: '[absolute-resource-path]' 
    }, 

    resolve: { 
        extensions: [".ts",".js",".json"]
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
                path.resolve(__dirname,'production'),
                path.resolve(__dirname,'node_modules')
            ], 
            loader:"awesome-typescript-loader"
          },     
          {      
            enforce:"pre", 
            test:/\.js$/,       
            exclude:[
                path.resolve(__dirname,'production'),
                path.resolve(__dirname,'node_modules')
            ], 
            loader:'babel-loader', 
            query:{presets: ['es2015']}  
          }    
        ]    
    },
  
    devtool: 'sourcemap', 

    plugins:[ 
        new CleanWebpackPlugin(['production']),
        new webpack.DefinePlugin({
          'process.env.NODE_ENV':JSON.stringify('development')
        }), 
    ], 

    target: "electron",      
 
    node: { 
        __dirname: false, 
        __filename: false
    }       
};
  