let path = require("path");
let webpack = require('webpack'); 
var HtmlWebpackPlugin = require('html-webpack-plugin');


module.exports =  { 
    entry: {},                                         
    output: {                  
        filename : '[name].js' ,
        path : path.resolve(__dirname,"compiledTests")  
    },      
    resolve: { 
        extensions: [".tsx", ".js", ".json", ".ts"],
        alias: {
            'sinon': 'sinon/pkg/sinon'
        }
    },  
    externals: { 
        'jsdom': 'window',
        'cheerio': 'window',
        'react/lib/ExecutionEnvironment': true
    },
    module: { 
         noParse: [
            /node_modules\/sinon\//,
        ], 
        rules: [   
            {   
                test:/\.(ts|tsx)?$/,  
                exclude: path.resolve(__dirname,'node_modules'), 
                loader:"awesome-typescript-loader" 
            },  
            {   
                test: /\.(css|scss)$/,   
                use: [ 'style-loader', 'css-loader']
            },  
            {   
                test   : /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9=&.]+)?$/,
                loader: 'file-loader' 
            },    
            {      
                test:/\.js$/,       
                exclude: path.resolve(__dirname,'node_modules'), 
                loader: 'babel-loader',
                query: {presets: ['es2015']}  
            }     
        ]         
    },   
    target:'web',   
    plugins : [].map(  
                (name) =>  new HtmlWebpackPlugin({
                                inject:'body', 
                                template:"tests.html",
                                title:'Test',      
                                chunks:[name], 
                                filename:name+'.html'
                            })  
              ) 
  
};
 
    