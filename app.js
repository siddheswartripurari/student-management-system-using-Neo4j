var express = require('express');
var logger = require('morgan');
var path = require('path');
var bodyParser = require('body-parser');
var neo4j = require('neo4j-driver');

var app = express();

app.set('views', path.join(__dirname,'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));
app.use(express.static(path.join(__dirname,'public')));

var driver = neo4j.driver('bolt://localhost', neo4j.auth.basic('neo4j', '123456'));
var driver1 = neo4j.driver('bolt://localhost', neo4j.auth.basic('neo4j', '123456'));
var driver2 = neo4j.driver('bolt://localhost', neo4j.auth.basic('neo4j', '123456'));
var driver3 = neo4j.driver('bolt://localhost', neo4j.auth.basic('neo4j', '123456'));
var session = driver.session();
var session1 = driver1.session();
var session2 = driver2.session();
var session3 = driver2.session();

app.get('/', function(req, res){
    session
           .run('MATCH(n:student) RETURN n')
           .then(function(result){
               var students = [];
               result.records.forEach(function(record){
                   students.push({
                       id: record._fields[0].identity.low,
                       name: record._fields[0].properties.name,
                       reg: record._fields[0].properties.regno
                   });

               });

               session
                      .run('MATCH (student) return student.name, student.POB')
                      .then(function(result2){
                          var AP = [];
                          result.records.forEach(function(record){
                            AP.push({
                                id: record._fields[0].identity.low,
                                name: record._fields[0].properties.name,
                                pob: record._fields[0].properties.POB
                            });

                          });

                          res.render('index', {
                              student: students,
                              ap: AP
                          });
                      })
                      .catch(function(err){
                          console.log(err);

                      });
           })
           .catch(function(err){
               console.log(err)
           });

});

app.post('/student/add',function(req, res){
    var name = req.body.student_name;
    var regno = req.body.reg_number;
    var residence = req.body.residence;
    var gender = req.body.gender;
    var yob = req.body.yob;
    var pob = req.body.pob;

    session1
           .run('CREATE (n:student {name: $name1param, regno:$regno1param, gender:$gender1param, residernce:$residence1param, YOB:$YOB1param, POB:$POB1param}) RETURN n.name, n.regno, n.gender, n.residernce, n.YOB, n.POB', {name1param:name, regno1param:regno, residence1param:residence, gender1param:gender, YOB1param:yob, POB1param:pob})
           .then(function(result){
               res.redirect('/');
               session1.close();

           })
           .catch(function(err){
               console.log(err);
               
           })
    res.redirect('/');
});

app.post('/student/delete',function(req, res){
    var regno = req.body.reg_number;
    session1
           .run('MATCH (n:student) WHERE n.regno=$regnoparam DELETE n', {regnoparam:regno})
           .then(function(result){
               res.redirect('/');
               session1.close();

           })
           .catch(function(err){
               console.log(err);
               
           })
    res.redirect('/');
});

app.post('/student/update',function(req, res){
    var regno = req.body.reg_number;
    var name = req.body.student_name;
    session2
           .run('MATCH (n:student) WHERE n.regno=$regnoparam SET n.name=$nameparam', {regnoparam:regno, nameparam:name})
           .then(function(result){
               res.redirect('/');
               session1.close();

           })
           .catch(function(err){
               console.log(err);
               
           })
    res.redirect('/');
});

app.post('/student/regsub',function(req, res){
    var regno = req.body.reg_number;
    var subject = req.body.subject;
    session3
           .run('match (a:student),(b:subject) where a.regno = $regnoparam AND b.name = $subnameparam create (a)-[:student_of]->(b) return a,b', {regnoparam:regno, subnameparam:subject})
           .then(function(result){
               res.redirect('/');
               session1.close();

           })
           .catch(function(err){
               console.log(err);
               
           })
    res.redirect('/');
});


app.listen(3000);
console.log('Server Started on Port 3000');

module.exports = app;