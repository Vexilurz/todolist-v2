import { encryptDoc, decryptDoc } from "../../../app/utils/crypto/crypto";
import { generateRandomDatabase } from "../../../randomDatabase/generateRandomDatabase";
import { Todo, Project, LayoutItem, Heading } from "../../../app/types";
import { isEmpty, equals } from 'ramda';
import { ChecklistItem } from './../../../app/types';
import { isString } from "../../../app/utils/isSomething";
const uniqid = require("uniqid");
let expect = require('chai').expect;


describe(
    'crypto', 
    () => {  
        let onError = (err) => expect(false,`error: ${err.msg}${err.message}`).to.equal(true);

        it(    
            ``,
            function(){ 
                this.timeout(0);
                let salt = uniqid();
                let pwd = uniqid();
                let randomKey = '';//pwdToKey(salt)(pwd); 
                let opt = {todos:15, projects:15, areas:15};
                let { todos, projects, areas } = generateRandomDatabase(opt, 0);
                
                todos.forEach( 
                    todo => {

                        let encrypted : Todo = encryptDoc("todos", randomKey, onError)(todo);

                        expect(encrypted.enc, 'should be marked as encrypted. todo.').to.equal(true);

                        if(!isEmpty(todo.title)){
                            expect(isEmpty(encrypted.title), 'should not be empty. todo.').to.equal(false);
                        }

                        expect(encrypted.title, 'should be different when encrypted. todo.').to.not.equal(todo.title);

                        encrypted.checklist.forEach( 
                            (item:ChecklistItem,idx:number) => {
                                let prev = todo.checklist[idx];

                                expect(item.text, 'checklist item should be different when encrypted. todo.').to.not.equal(prev.text);

                                if(!isEmpty(prev.text)){
                                    expect(isEmpty(item.text), 'checklist item should not be empty. todo.').to.equal(false);
                                }
                            } 
                        );

                        encrypted.attachedTags.forEach( 
                            (tag:string,idx:number) => {
                                let prev = todo.attachedTags[idx];

                                expect( tag ).to.not.equal(prev);

                                if(!isEmpty(prev)){
                                    expect(isEmpty(tag)).to.equal(false);
                                }
                            } 
                        );

                        let decrypted = decryptDoc("todos",randomKey,onError)(encrypted);
                        expect(decrypted.enc, 'should be marked as decrypted. todo.').to.equal(false);
                        
                        delete decrypted.enc;

                        expect(todo,'should be equal when decrypted. todo.').to.deep.equal(decrypted);
                       
                    } 
                );
 

                projects.forEach( 
                    project => {
                        let encrypted : Project = encryptDoc("projects", randomKey, onError)(project);

                        expect( encrypted.enc, 'should be marked as encrypted. project.').to.equal(true);

                        if(!isEmpty(project.name)){
                            expect( isEmpty(encrypted.name), 'should not be empty. project.' ).to.equal(false);
                        }

                        expect( encrypted.name, 'name should be different when encrypted. project.' ).to.not.equal(project.name);

                        encrypted.layout.forEach( 
                            (item:Heading,idx:number) => {
                                let prev = project.layout[idx] as Heading;

                                if(isString(prev)){ return }

                                expect( item.title, 'heading should be different when encrypted. project.' ).to.not.equal(prev.title);

                                if(!isEmpty(prev.title)){
                                    expect(isEmpty(item.title)).to.equal(false);
                                }
                            } 
                        );

                        let decrypted = decryptDoc("projects",randomKey,onError)(encrypted);
                        expect(decrypted.enc, 'should be marked as decrypted. project.' ).to.equal(false);

                        delete decrypted.enc;

                        expect(project,'should be equal when decrypted. project.').to.deep.equal(decrypted);                        
                    } 
                )
            } 
        );
    } 
); 