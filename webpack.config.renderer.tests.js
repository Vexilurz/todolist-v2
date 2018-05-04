const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');      
const CleanWebpackPlugin = require('clean-webpack-plugin');   
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

module.exports = [
    {     
        mode:'development',
         
        entry:{    
            'test':'./tests/renderer/app/test.tsx',
        },  

        output:{             
            filename:'[name].js', 
            path:path.resolve(__dirname,"tests","dist","renderer") 
        },     
        
        resolve: { 
            extensions: [".ts", ".tsx", ".js", ".json", ".css"]
        }, 

        module: {  
            rules:[ 
                {   
                    test: /\.(css|scss)$/,  
                    exclude: /(node_modules|production)\/(?!(draft-js)\/).*/,  
                    use: [ 'style-loader', 'css-loader']
                },  
                {  
                    test:/\.(ts|tsx)?$/,  
                    exclude: /(node_modules)/,  
                    loader:"awesome-typescript-loader" 
                },       
                {   
                    test   : /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9=&.]+)?$/,
                    exclude: /(node_modules)/, 
                    loader: 'file-loader'  
                }, 
                {     
                    test: /\.js$/,
                    exclude: /(node_modules)/, 
                    loader: 'babel-loader',
                    options: {
                        presets: ['env']
                    },
                }  
            ]   
        }, 
        
        target: "web",     
        
        plugins : [
            new webpack.DefinePlugin({
                NODE_ENV: JSON.stringify('development'),
                window:{}
            }),
            new HtmlWebpackPlugin({
                title: 'Tests',
                template: './tests/index.html'
            })
        ],
        
        node: {
            fs: 'empty'
        }
    }
];
 
   