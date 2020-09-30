const path = require("path"); 
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');  
const CleanWebpackPlugin = require('clean-webpack-plugin');
// const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {    
    context: __dirname, 

    mode:'development',
 
    entry:{ 
        'randomDatabase':'./randomDatabase.ts'
    }, 

    output:{              
        filename : '[name].js' ,
        path : path.resolve(__dirname)
    }, 

    resolve:{ 
        extensions: [".ts", ".tsx", ".js"]
    },  

    module:{ 
        rules: [
            {  
                test:/\.(ts|tsx)?$/, 
                loader:"awesome-typescript-loader",
                exclude: /(node_modules|bower_components)/,
                options: { 
                    sourceMap: true,
                    /*
                    useBabel: true,
                    babelOptions: {
                        "babelrc": false, 
                        "presets": [
                            "@babel/preset-env"
                        ]
                    },
                    babelCore: "@babel/core"
                    */
                }
            }
        ]    
    },

/*
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
*/  
    plugins:[ 
        new CleanWebpackPlugin(['./randomDatabase.js','databases'])
    ], 

    target: "electron-main",

    node: {
        __dirname: false,
        __filename: false
    }
};
  