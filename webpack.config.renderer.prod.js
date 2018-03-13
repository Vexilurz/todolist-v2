const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const webpackTargetElectronRenderer = require('webpack-target-electron-renderer');   
const CopyWebpackPlugin = require('copy-webpack-plugin');      
const CleanWebpackPlugin = require('clean-webpack-plugin');   
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const CompressionPlugin = require("compression-webpack-plugin");

module.exports = {     
    context: __dirname + "/app",
    
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
            use: [ 'style-loader', 'css-loader']
          },  
          {  
            test:/\.(ts|tsx)?$/,  
            exclude: path.resolve(__dirname,'node_modules'), 
            loader:"awesome-typescript-loader"
          },       
          {   
            test   : /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9=&.]+)?$/,
            loader: 'file-loader'  
          },    
          {    
            enforce:"pre",  
            test:/\.js$/,       
            exclude: path.resolve(__dirname,'node_modules'), 
            loader: 'babel-loader',
            query: {
                presets: [["es2015", { "modules": false }]]
            }  
          }     
        ]    
    }, 

    devtool: 'cheap-module-source-map',
    
    target:'electron', 
          
    plugins : [
        new CleanWebpackPlugin(['production']),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': '"production"'
        }),
        /*new UglifyJsPlugin({
            uglifyOptions:{
                mangle: true,
                compress: {
                    warnings: false, // Suppress uglification warnings
                    pure_getters: true,
                    unsafe: true,
                    unsafe_comps: true
                },
                output: {
                    comments: false,
                }
            } 
        }),*/
        new CompressionPlugin({
            asset: "[path].gz[query]",
            algorithm: "gzip",
            test: /\.js$|\.css$|\.html$/,
            threshold: 10240,
            minRatio: 0
        }),
        new CopyWebpackPlugin([{from : './assets'}]), 
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
 
   