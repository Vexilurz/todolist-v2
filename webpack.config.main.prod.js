const path = require("path"); 
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');  
const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const env = process.env.NODE_ENV || 'production';

module.exports = {     
    context: __dirname + "/app",  

    mode:'production',

    entry: { 
        'main':'./main/main.ts',    
    },    
     
    output: {              
        filename : '[name].js' ,
        path : path.resolve(__dirname,"production")
    },      
 
    resolve: { 
        extensions: [".ts", ".tsx", ".js"]
    },        
                 
    module: {
        rules: [ 
          {  
            test:/\.(ts|tsx)?$/,  
            exclude: /(node_modules)/, 
            loader:"awesome-typescript-loader"
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
 
    target: "electron-main",     
    
    optimization: {
		minimize: true,
		minimizer: [
			new UglifyJsPlugin({
                uglifyOptions:{
                    output:{
                        comments:false
                    },
                    compress:{
                        unsafe_comps:true,
                        properties:true,
                        keep_fargs:false,
                        pure_getters:true,
                        collapse_vars:true,
                        //unsafe:true,
                        warnings:false,
                        sequences:true,
                        dead_code:true,
                        drop_debugger:true,
                        comparisons:true,
                        conditionals:true,
                        evaluate:true,
                        booleans:true,
                        loops:true,
                        unused:true,
                        hoist_funs:true,
                        if_return:true,
                        join_vars:true,
                        drop_console:true
                    }
                }
            })
		]
	},
    
    plugins:[ 
        new CleanWebpackPlugin(['production']),
        new webpack.DefinePlugin({
            PRODUCTION: JSON.stringify(true),
            NODE_ENV: JSON.stringify('production')
        })
    ], 

    node:{ 
        __dirname: false, 
        __filename: false
    }       
};
  