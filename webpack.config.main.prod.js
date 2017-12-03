var path = require("path"); 
var webpack = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');  
const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');


module.exports = {     
      
    entry: { 
        'main':'./app/main/main.ts',   
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
 
    target: "electron",      
    
    plugins:[ 
        new CleanWebpackPlugin(['production']),
        new webpack.DefinePlugin({
         'process.env' : {
            'NODE_ENV' : JSON.stringify('production')
          } 
        }),
        new UglifyJSPlugin()
    ], 

    node: { 
        __dirname: false,
        __filename: false
    }       
};
  