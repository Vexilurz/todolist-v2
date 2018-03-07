const path = require("path"); 
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');  
const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const CompressionPlugin = require("compression-webpack-plugin");

module.exports = {     
    context: __dirname + "/app",  

    entry: { 
        'main':'./main/main.ts',    
    },    
     
    output: {              
        filename : '[name].js' ,
        path : path.resolve(__dirname,"production"),
        devtoolModuleFilenameTemplate: '[absolute-resource-path]' 
    },      
 
    resolve: { 
        extensions: [".ts", ".tsx", ".js", ".json"]
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
            test:/\.js$/,       
            exclude: path.resolve(__dirname,'node_modules'), 
            loader: 'babel', 
            query: {presets: ['es2015']}  
          }    
        ]    
    },
 
    devtool: 'cheap-module-source-map',

    target: "electron",      
    
    plugins:[ 
        new CleanWebpackPlugin(['production']),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': '"production"'
        }),
        /*new UglifyJsPlugin({
            uglifyOptions:{
                mangle: true,
                compress: {
                    warnings: false, // Suppress uglification warnings
                    pure_getters: true
                },
                output: {
                    comments: false
                }
            }
        }),
        new CompressionPlugin({
            asset: "[path].gz[query]",
            algorithm: "gzip",
            test: /\.js$|\.css$|\.html$/,
            threshold: 10240,
            minRatio: 0
        })*/
    ], 

    node: { 
        __dirname: false,
        __filename: false
    }       
};
  