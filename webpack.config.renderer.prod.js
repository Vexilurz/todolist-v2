const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');      
const CleanWebpackPlugin = require('clean-webpack-plugin');   
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

module.exports = {     
    context: __dirname + "/app",

    mode:'production',
    
    entry:{    
        'app':'./app.tsx',
        'quickentry':'./quickentry.tsx',
        'notification':'./notification.tsx'
    },  

    output:{             
        filename:'[name].js', 
        path:path.resolve(__dirname,"production") 
    },     
     
    resolve: { 
        extensions: [".ts", ".tsx", ".js", ".json", ".css"]
    }, 
                   
    module: { 
        rules: [ 
          {   
            test: /\.(css|scss)$/,  
            exclude: /(node_modules|production)\/(?!(draft-js)\/).*/,  
            use: [ 'style-loader', 'css-loader']
          },  
          {  
            test:/\.(ts|tsx)?$/,  
            exclude:/(node_modules|production)/, 
            loader:"awesome-typescript-loader"
          },       
          {   
            test   : /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9=&.]+)?$/,
            exclude: /(node_modules|production)/, 
            loader: 'file-loader'  
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
    
    target: "electron-renderer",     
    
    optimization: {
		minimize: true,
		minimizer: [
			new UglifyJsPlugin({
                sourceMap:false,
                uglifyOptions:{
                    output:{
                        comments:false
                    }//,
                    //compress:false
                    /*{
                        //unsafe_comps:true,
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
                    }*/
                }
            })
		]
    },
    
          
    plugins : [
        new CopyWebpackPlugin([{from : './assets'}]),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production')
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
};
 
   