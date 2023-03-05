var express = require('express');
var router = express.Router();
var connection=require('../db');
var path = require('path');
var fs = require('fs');
var multer  = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploads')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey("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");

var upload = multer({
    storage: storage,
}).fields([{ name: 'question', maxCount: 1 }, { name: 'answer', maxCount: 1 }]);

var upload1 = multer({
    storage: storage,
}).single('file');

router.get('/', function(req, res){
    console.log('ashdgasgdhsad');
    if(req.user) {
            var g = 'Instructor';
        connection.query("SELECT * FROM USER WHERE id = ? AND Role = ?",[req.user, g] ,function(err1,rows1){
            if(err1 || rows1.length === 0) {
                console.log(err1);
                res.redirect('/users/login')

            }
            else {
                connection.query("SELECT * FROM INSTRUCTOR WHERE User_id = ?  ",req.user ,function(err2,rows2){
                    if(err2) {
                        console.log(err2);
                        res.redirect('/users/login')

                    }
                    else {
                        console.log(rows1[0]);

                        res.render('instructor/home',{'user':rows1[0], 'instructor': rows2[0],  messages: req.flash('info')});
                    }
                });
            }
        });
    }
    else{
        return res.redirect('/users/login')
    }

});





router.post('/profile', function(req, res, next){
    if(req.user){


        req.checkBody('phone', 'Phone Number is Not Valid').isNumeric();

        const errors = req.validationErrors();

        if(errors){
            req.flash('info', errors[0].msg);
            res.redirect('/instructor/profile/');
        }
        else
        {
            console.log('ddd');
            var First_Name = req.body.fname;
            var Middle_Name = req.body.mname;
            var Last_Name = req.body.lname;


            connection.query("SELECT * FROM USER WHERE id = ? AND Role = ?",[req.user, 'Instructor'] ,function(err1,rows1){
                if(err1) {
                    console.log(err1);
                    res.redirect('/users/login')

                }
                else if(rows1[0].role === 'Instructor') {
                    connection.query("UPDATE INSTRUCTOR SET First_Name = ?, Middle_Name = ?, Last_Name = ? WHERE User_id = ?  ",[First_Name, Middle_Name, Last_Name,req.user] ,function(err2,rows2){
                        if(err2) {
                            console.log(err2);
                            res.redirect('/users/login')

                        }
                        else {
                            req.flash('info', 'Profile Successfully Updated!');
                            res.redirect('/instructor/profile/');
                        }
                    });
                }
            });
        }



    }
    else {
        res.redirect('/login/')
    }
});





router.get('/profile', function(req, res, next) {
    if(req.user){
        connection.query("SELECT * FROM USER WHERE id = ? AND Role = ?",[req.user, 'Instructor'] ,function(err1,rows1){
            if(err1) {
                console.log(err1);
                res.redirect('/users/login')

            }
            else {
                connection.query("SELECT * FROM INSTRUCTOR WHERE User_id = ?  ",req.user ,function(err2,rows2){
                    if(err2) {
                        console.log(err2);
                        res.redirect('/users/login')

                    }
                    else {
                        console.log(rows1[0]);
                        res.render('instructor/profile',{'user':rows1[0], 'instructor': rows2[0],  messages: req.flash('info')});
                    }
                });
            }
        });
    }
    else {
        res.redirect('/users/login/')
    }

});


router.post('/offer-course', function(req, res){
    if(req.user) {

        connection.query("SELECT * FROM USER WHERE id = ? AND Role = ?",[req.user, 'Instructor'] ,function(err1,rows1){
            if(err1) {
                console.log(err1);
                res.redirect('/users/login')

            }
            else {
                connection.query("SELECT * FROM INSTRUCTOR WHERE User_id = ?  ",req.user ,function(err2,rows2){
                    if(err2) {
                        console.log(err2);
                        res.redirect('/users/login')

                    }
                    else {
                        console.log(rows1[0]);


                        var data = {
                            'Course_Title': req.body.title,
                            'Course_Code': req.body.code,
                            'Instructor_id': rows2[0].Instructor_id
                        };

                        connection.query("INSERT INTO COURSE SET  ? ",data ,function(err3,rows3){
                            if(err3) {
                                console.log(err3);
                                res.redirect('/offer-course')

                            }
                            else {

                                connection.query("SELECT LAST_INSERT_ID() as id" ,function(err4,rows4){
                                    if(err4) {
                                        console.log(err4);
                                        res.redirect('/offer-course')

                                    }
                                    else {
                                        console.log(rows4[0]);
                                        url = '/instructor/course-details/' + rows4[0].id;
                                        req.flash('info', 'Course Successfully Added!. Please Update the Course');
                                        return res.redirect(url);
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }
    else{
        return res.redirect('/users/login')
    }
});




router.get('/courses', function(req, res){
    if(req.user) {

        connection.query("SELECT * FROM USER WHERE id = ? AND Role = ?",[req.user, 'Instructor'] ,function(err1,rows1){
            if(err1) {
                console.log(err1);
                res.redirect('/users/login')

            }
            else {
                connection.query("SELECT * FROM INSTRUCTOR WHERE User_id = ?  ",req.user ,function(err2,rows2){
                    if(err2) {
                        console.log(err2);
                        res.redirect('/users/login')

                    }
                    else {
                        connection.query("SELECT * FROM COURSE WHERE Instructor_id = ?  ",rows2[0].Instructor_id ,function(err3,rows3){
                            if(err3) {
                                console.log(err2);
                                res.redirect('/users/login')

                            }
                            else {

                                res.render('instructor/courses',{'user':rows1[0], 'instructor': rows2[0], 'courses': rows3,  messages: req.flash('info')});
                            }
                        });

                    }
                });
            }
        });
    }
    else{
        return res.redirect('/users/login')
    }
});


router.get('/course-details/:id', function(req, res){
    if(req.user) {

        connection.query("SELECT * FROM USER WHERE id = ? AND Role = ?",[req.user, 'Instructor'] ,function(err1,rows1){
            if(err1) {
                console.log(err1);
                res.redirect('/users/login')

            }
            else {
                connection.query("SELECT * FROM INSTRUCTOR WHERE User_id = ?  ",req.user ,function(err2,rows2){
                    if(err2) {
                        console.log(err2);
                        res.redirect('/users/login')

                    }
                    else {
                        connection.query("SELECT * FROM COURSE WHERE Course_id = ?  ",req.params.id ,function(err3,rows3){
                            if(err3) {
                                console.log(err3);
                                res.redirect('/instructor/courses/')

                            }
                            else {

                                connection.query("SELECT * FROM ANOUNCEMENT WHERE Course_id = ?  AND Instructor_id = ? ORDER BY -Posted_on LIMIT 5",[req.params.id, rows2[0].Instructor_id] ,function(err4,rows4){
                                    if(err4) {
                                        console.log(err4);
                                        res.redirect('/instructor/courses/')

                                    }
                                    else {
                                        console.log(rows4);
                                        res.render('instructor/course',{'user':rows1[0], 'instructor': rows2[0], 'course': rows3[0], 'announcements': rows4,  messages: req.flash('info')});
                                    }
                                });
                            }
                        });

                    }
                });
            }
        });
    }
    else{
        return res.redirect('/users/login')
    }
});




router.post('/course-details/:id', function(req, res){
    if(req.user) {

        connection.query("SELECT * FROM USER WHERE id = ? AND Role = ?",[req.user, 'Instructor'] ,function(err1,rows1){
            if(err1) {
                console.log(err1);
                res.redirect('/users/login')

            }
            else {
                connection.query("SELECT * FROM INSTRUCTOR WHERE User_id = ?  ",req.user ,function(err2,rows2){
                    if(err2) {
                        console.log(err2);
                        res.redirect('/users/login')

                    }
                    else {

                        var data;

                        if(req.body.introduction){
                            data = {
                                'Introduction' : req.body.introduction
                            };
                        }
                        else if(req.body.description){
                            data = {
                                'Description' : req.body.description
                            };
                        }
                        else if(req.body.requirements){
                            data = {
                                'Requirements' : req.body.requirements
                            };
                        }

                        connection.query("UPDATE COURSE SET ?  WHERE Course_id = ?",[ data, req.params.id] ,function(err3,rows3){
                            if(err3) {
                                console.log(err3);
                                res.redirect('/instructor/courses/')

                            }
                            else {
                                console.log(rows3[0]);
                                req.flash('info', 'Course Details Successfully Updated!');
                                url = '/instructor/course-details/' + req.params.id;
                                return res.redirect(url);
                            }
                        });
                    }
                });
            }
        });
    }
    else{
        return res.redirect('/users/login')
    }
});




router.get('/offer-course', function(req, res){
    if(req.user) {

        connection.query("SELECT * FROM USER WHERE id = ? AND Role = ?",[req.user, 'Instructor'] ,function(err1,rows1){
            if(err1) {
                console.log(err1);
                res.redirect('/users/login')

            }
            else {
                connection.query("SELECT * FROM INSTRUCTOR WHERE User_id = ?  ",req.user ,function(err2,rows2){
                    if(err2) {
                        console.log(err2);
                        res.redirect('/users/login')

                    }
                    else {
                        console.log(rows1[0]);
                        res.render('instructor/offer_course',{'user':rows1[0], 'instructor': rows2[0],  messages: req.flash('info')});
                    }
                });
            }
        });
    }
    else{
        return res.redirect('/users/login')
    }
});




router.get('/course/announcement/:id1/:id2', function(req, res){
    if(req.user) {

        connection.query("SELECT * FROM USER WHERE id = ? AND Role = ?",[req.user, 'Instructor'] ,function(err1,rows1){
            if(err1) {
                console.log(err1);
                res.redirect('/users/login')

            }
            else {
                connection.query("SELECT * FROM INSTRUCTOR WHERE User_id = ?  ",req.user ,function(err2,rows2){
                    if(err2) {
                        console.log(err2);
                        res.redirect('/users/login')

                    }
                    else {
                        connection.query("SELECT * FROM COURSE WHERE Course_id = ?  ",req.params.id1 ,function(err3,rows3){
                            if(err3) {
                                console.log(err3);
                                res.redirect('/instructor/courses/')

                            }
                            else {

                                connection.query("SELECT * FROM ANOUNCEMENT WHERE Course_id = ? AND Instructor_id = ? ORDER BY -Posted_on LIMIT 5",[req.params.id1, rows2[0].Instructor_id] ,function(err4,rows4){
                                    if(err4) {
                                        console.log(err4);
                                        res.redirect('/instructor/courses/')

                                    }
                                    else {

                                        connection.query("SELECT * FROM ANOUNCEMENT WHERE Anouncement_id = ? ",req.params.id2 ,function(err5,rows5){
                                            if(err5) {
                                                console.log(err5);
                                                res.redirect('/instructor/courses/')

                                            }
                                            else {

                                                console.log(rows4);
                                                res.render('instructor/announcement',{'user':rows1[0], 'instructor': rows2[0], 'course': rows3[0], 'announcement': rows5[0], 'announcements': rows4,  messages: req.flash('info')});
                                            }
                                        });


                                    }
                                });
                            }
                        });

                    }
                });
            }
        });
    }
    else{
        return res.redirect('/users/login')
    }
});



router.post('/course/announcement/:id', function(req, res){
    if(req.user) {

        connection.query("SELECT * FROM USER WHERE id = ? AND Role = ?",[req.user, 'Instructor'] ,function(err1,rows1){
            if(err1) {
                console.log(err1);
                res.redirect('/users/login')

            }
            else {
                connection.query("SELECT * FROM INSTRUCTOR WHERE User_id = ?  ",req.user ,function(err2,rows2){
                    if(err2) {
                        console.log(err2);
                        res.redirect('/users/login')

                    }
                    else {

                        var description = req.body.description;
                        var details = req.body.details;
                        var link1 = req.body.link1;
                        var link2 = req.body.link2;
                        var link3 = req.body.link3;

                        var data = {
                            'Short_Description': description,
                            'Anouncement_Details': details,
                            'Link1': link1,
                            'Link2': link2,
                            'Link3': link3,
                            'Course_id': req.params.id,
                            'Instructor_id':rows2[0].Instructor_id
                        };


                        connection.query("INSERT INTO ANOUNCEMENT SET ? , Posted_on = now()",data ,function(err3,rows3){
                            if(err3) {
                                console.log(err3);
                                res.redirect('/instructor/courses/')

                            }
                            else {
                                console.log(rows3[0]);
                                var url = '/instructor/course-details/' + req.params.id;
                                req.flash('info', 'Announcemnet has Successfully Posted!');
                                res.redirect(url);
                            }
                        });
                    }
                });
            }
        });
    }
    else{
        return res.redirect('/users/login')
    }
});


router.get('/course/:course_id/resources/', function(req, res){
    if(req.user) {

        connection.query("SELECT * FROM USER WHERE id = ? AND Role = ?",[req.user, 'Instructor'] ,function(err1,rows1){
            if(err1) {
                console.log(err1);
                res.redirect('/users/login')

            }
            else {
                connection.query("SELECT * FROM INSTRUCTOR WHERE User_id = ?  ",req.user ,function(err2,rows2){
                    if(err2) {
                        console.log(err2);
                        res.redirect('/users/login')

                    }
                    else {
                        connection.query("SELECT * FROM COURSE WHERE Course_id = ?  ",req.params.course_id ,function(err3,rows3){
                            if(err3) {
                                console.log(err3);
                                res.redirect('/instructor/courses/')

                            }
                            else {

                                connection.query("SELECT * FROM ANOUNCEMENT WHERE Course_id = ?  AND Instructor_id = ? ORDER BY -Posted_on LIMIT 5",[req.params.course_id, rows2[0].Instructor_id] ,function(err4,rows4){
                                    if(err4) {
                                        console.log(err4);
                                        res.redirect('/instructor/courses/')

                                    }
                                    else {

                                        connection.query("SELECT * FROM COURSE_MATERIALS WHERE Course_id = ? AND Instructor_id = ?",[req.params.course_id, rows2[0].Instructor_id] ,function(err5,rows5){
                                            if(err5) {
                                                console.log(err5);
                                                res.redirect('/instructor/courses/')

                                            }
                                            else {
                                                console.log(rows5);
                                                res.render('instructor/resources',{'user':rows1[0], 'instructor': rows2[0], 'course': rows3[0], 'announcements': rows4, 'resources': rows5,  messages: req.flash('info')});
                                            }
                                        });
                                    }
                                });
                            }
                        });

                    }
                });
            }
        });
    }
    else{
        return res.redirect('/users/login')
    }
});


router.post('/course/:course_id/resources/', function (req, res) {
    console.log("asdasdas00")
    console.log('bbbnvnb');
    upload1(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            console.log(err);
            return res.redirect('/instructor/')
        } else if (err) {
            // An unknown error occurred when uploading.
            console.log(err);
            return res.redirect('/instructor/')
        }

        // Everything went fine.
        if(req.user) {

            connection.query("SELECT * FROM USER WHERE id = ? AND Role = ?",[req.user, 'Instructor'] ,function(err1,rows1){
                if(err1) {
                    console.log(err1);
                    res.redirect('/users/login')

                }
                else {
                    connection.query("SELECT * FROM INSTRUCTOR WHERE User_id = ?  ",req.user ,function(err2,rows2){
                        if(err2) {
                            console.log(err2);
                            res.redirect('/users/login')

                        }
                        else {

                            // Material_id INT NOT NULL AUTO_INCREMENT,
                            //     Topic VARCHAR(255),
                            //     Remark VARCHAR(255),
                            //     Material LONGBLOB,
                            //     Course_id INT NOT NULL,
                            //     Instructor_id INT NOT NULL,
                            console.log(req.file);
                            console.log("spome data0")
                            var data = {
                                'Name': req.body.resource_name,
                                'Material' : path.join(__dirname, "../public/uploads/" + req.file.filename),
                                'Course_id': req.params.course_id,
                                'Instructor_id': rows2[0].Instructor_id
                            };
                            console.log(data);
                            connection.query("INSERT INTO COURSE_MATERIALS SET ?",data ,function(err4,rows4){
                                if(err4) {
                                    console.log(err4);
                                    res.redirect('/instructor/courses/')

                                }
                                else {
                                    console.log(rows4);
                                    console.log("added")
                                    var url = '/instructor/course/' + req.params.course_id + '/resources/';
                                    req.flash('info', 'New Resource Successfully Added to Resource Section!');
                                    res.redirect(url);
                                }
                            });

                        }
                    });
                }
            });
        }
        else{
            return res.redirect('/users/login')
        }
    });
});

router.get('/course/:course_id/resources/:resource_id', function (req, res) {

    if(req.user) {

        connection.query("SELECT * FROM USER WHERE id = ? AND Role = ?",[req.user, 'Instructor'] ,function(err1,rows1){
            if(err1) {
                console.log(err1);
                res.redirect('/users/login')

            }
            else {
                connection.query("SELECT * FROM INSTRUCTOR WHERE User_id = ?  ",req.user ,function(err2,rows2){
                    if(err2) {
                        console.log(err2);
                        res.redirect('/users/login')

                    }
                    else {
                        connection.query("SELECT * FROM COURSE WHERE Course_id = ?  ",req.params.course_id ,function(err3,rows3){
                            if(err3) {
                                console.log(err3);
                                res.redirect('/instructor/courses/')

                            }
                            else {

                                connection.query("SELECT * FROM COURSE_MATERIALS WHERE Material_id = ?",[req.params.resource_id] ,function(err4,rows4){
                                    if(err4) {
                                        console.log(err4);
                                        res.redirect('/instructor/courses/')

                                    }
                                    else {
                                        console.log(rows4[0].Material);
                                        res.sendFile(rows4[0].Material);

                                    }
                                });
                            }
                        });

                    }
                });
            }
        });
    }
    else{
        return res.redirect('/users/login')
    }
});

router.get('/course/:course_id/resources/:resource_id/delete', function (req, res) {

    if(req.user) {

        connection.query("SELECT * FROM USER WHERE id = ? AND Role = ?",[req.user, 'Instructor'] ,function(err1,rows1){
            if(err1) {
                console.log(err1);
                res.redirect('/users/login')

            }
            else {
                connection.query("SELECT * FROM INSTRUCTOR WHERE User_id = ?  ",req.user ,function(err2,rows2){
                    if(err2) {
                        console.log(err2);
                        res.redirect('/users/login')

                    }
                    else {
                        connection.query("SELECT * FROM COURSE WHERE Course_id = ?  ",req.params.course_id ,function(err3,rows3){
                            if(err3) {
                                console.log(err3);
                                res.redirect('/instructor/courses/')

                            }
                            else {

                                connection.query("SELECT * FROM COURSE_MATERIALS WHERE Material_id = ?",[req.params.resource_id] ,function(err4,rows4){
                                    if(err4) {
                                        console.log(err4);
                                        res.redirect('/instructor/courses/')

                                    }
                                    else {

                                        fs.unlink(rows4[0].Material, (err5) => {
                                            if(err5) {
                                                console.log(err5);
                                                res.redirect('/instructor/courses/')

                                            }
                                            else {


                                                connection.query("DELETE FROM COURSE_MATERIALS WHERE Material_id = ?",[req.params.resource_id] ,function(err5,rows5){
                                                    if(err5) {
                                                        console.log(err5);
                                                        res.redirect('/instructor/courses/')

                                                    }
                                                    else {
                                                        console.log('File was deleted');
                                                        var url = '/instructor/course/' + req.params.course_id + '/resources/';
                                                        req.flash('info', ' Resource Successfully Deleted from Resource Section!');
                                                        res.redirect(url);

                                                    }
                                                });



                                            }
                                        });

                                    }
                                });
                            }
                        });

                    }
                });
            }
        });
    }
    else{
        return res.redirect('/users/login')
    }
});




router.get('/course/:course_id/students', function(req, res){
    if(req.user) {

        connection.query("SELECT * FROM USER WHERE id = ? AND Role = ?",[req.user, 'Instructor'] ,function(err1,rows1){
            if(err1) {
                console.log(err1);
                res.redirect('/users/login')

            }
            else {
                connection.query("SELECT * FROM INSTRUCTOR WHERE User_id = ?  ",req.user ,function(err2,rows2){
                    if(err2) {
                        console.log(err2);
                        res.redirect('/users/login')

                    }
                    else {
                        connection.query("SELECT * FROM COURSE WHERE Course_id = ?  ",req.params.course_id ,function(err3,rows3){
                            if(err3) {
                                console.log(err3);
                                res.redirect('/instructor/courses/')

                            }
                            else {

                                connection.query("SELECT * FROM ANOUNCEMENT WHERE Course_id = ?  AND Instructor_id = ? ORDER BY -Posted_on LIMIT 5",[req.params.course_id, rows2[0].Instructor_id] ,function(err4,rows4){
                                    if(err4) {
                                        console.log(err4);
                                        res.redirect('/instructor/courses/')

                                    }
                                    else {

                                        connection.query("SELECT * FROM STUDENT WHERE Student_id IN (SELECT Student_id FROM ENROLLED WHERE Course_id = ?) ORDER BY Student_id",[req.params.course_id] ,function(err5,rows5){
                                            if(err5) {
                                                console.log(err4);
                                                res.redirect('/instructor/courses/')

                                            }
                                            else {

                                                connection.query("SELECT count(*) as total ,Student_id FROM (SELECT  * FROM  ATTENDENCE  WHERE Course_id = ? AND Attended = 1 ORDER BY Student_id )A GROUP BY Student_id ",[req.params.course_id] ,function(err5,rows6){
                                                    if(err5) {
                                                        console.log(err4);
                                                        res.redirect('/instructor/courses/')

                                                    }
                                                    else {
                                                        connection.query("SELECT  COUNT(DISTINCT Date) as total FROM  ATTENDENCE  WHERE Course_id = ? ",[req.params.course_id] ,function(err5,c) {
                                                            if (err5) {
                                                                console.log(err5);
                                                                res.redirect('/instructor/')

                                                            }
                                                            else {

                                                                connection.query("SELECT  * FROM  PERMISSION, STUDENT  WHERE Course_id = ? AND PERMISSION.Student_id = STUDENT.Student_id",[req.params.course_id] ,function(err5,c1) {
                                                                    if (err5) {
                                                                        console.log(err5);
                                                                        res.redirect('/instructor/')

                                                                    }
                                                                    else {
                                                                        console.log(c);



                                                                        res.render('instructor/students', {
                                                                            'user': rows1[0],
                                                                            'instructor': rows2[0],
                                                                            'course': rows3[0],
                                                                            'announcements': rows4,
                                                                            'students': rows5,
                                                                            'attendence': rows6,
                                                                            'classes':c[0],
                                                                            'requested':c1,
                                                                            messages: req.flash('info')
                                                                        });
                                                                    }
                                                                });

                                                            }
                                                        });

                                                    }
                                                    });


                                            }
                                        });

                                    }
                                });
                            }
                        });

                    }
                });
            }
        });
    }
    else{
        return res.redirect('/users/login')
    }
});





router.get('/course/:course_id/:student_id/approve', function(req, res){
    if(req.user) {

        connection.query("SELECT * FROM USER WHERE id = ? AND Role = ?",[req.user, 'Instructor'] ,function(err1,rows1){
            if(err1) {
                console.log(err1);
                res.redirect('/users/login')

            }
            else {
                connection.query("SELECT * FROM INSTRUCTOR WHERE User_id = ?  ",req.user ,function(err2,rows2){
                    if(err2) {
                        console.log(err2);
                        res.redirect('/users/login')

                    }
                    else {
                        connection.query("SELECT * FROM COURSE WHERE Course_id = ?  ",req.params.course_id ,function(err3,rows3){
                            if(err3) {
                                console.log(err3);
                                res.redirect('/instructor/courses/')

                            }
                            else {

                                connection.query("SELECT * FROM ANOUNCEMENT WHERE Course_id = ?  AND Instructor_id = ? ORDER BY -Posted_on LIMIT 5",[req.params.course_id, rows2[0].Instructor_id] ,function(err4,rows4){
                                    if(err4) {
                                        console.log(err4);
                                        res.redirect('/instructor/courses/')

                                    }
                                    else {

                                        connection.query("SELECT * FROM STUDENT WHERE Student_id IN (SELECT Student_id FROM ENROLLED WHERE Course_id = ?) ORDER BY Student_id",[req.params.course_id] ,function(err5,rows5){
                                            if(err5) {
                                                console.log(err4);
                                                res.redirect('/instructor/courses/')

                                            }
                                            else {

                                                connection.query("SELECT count(*) as total ,Student_id FROM (SELECT  * FROM  ATTENDENCE  WHERE Course_id = ? AND Attended = 1 ORDER BY Student_id )A GROUP BY Student_id ",[req.params.course_id] ,function(err5,rows6){
                                                    if(err5) {
                                                        console.log(err4);
                                                        res.redirect('/instructor/courses/')

                                                    }
                                                    else {
                                                        connection.query("SELECT  Date, COUNT(Attendence_id) FROM  ATTENDENCE  WHERE Course_id = ?  GROUP BY Date",[req.params.course_id] ,function(err5,c) {
                                                            if (err5) {
                                                                console.log(err5);
                                                                res.redirect('/instructor/')

                                                            }
                                                            else {

                                                                var data = {
                                                                    'Student_id': req.params.student_id,
                                                                    'Course_id': req.params.course_id
                                                                };

                                                                connection.query("INSERT  INTO ENROLLED SET ?",data ,function(err5,c1) {
                                                                    if (err5) {
                                                                        console.log(err5);
                                                                        res.redirect('/instructor/')

                                                                    }
                                                                    else {


                                                                        connection.query("DELETE  FROM PERMISSION WHERE Student_id = ? AND Course_id = ?",[req.params.student_id, req.params.course_id] ,function(err5,c2) {
                                                                            if (err5) {
                                                                                console.log(err5);
                                                                                res.redirect('/instructor/')

                                                                            }
                                                                            else {



                                                                                res.redirect('/instructor/course/'+req.params.course_id+'/students/')

                                                                            }
                                                                        });


                                                                    }
                                                                });

                                                            }
                                                        });

                                                    }
                                                });


                                            }
                                        });

                                    }
                                });
                            }
                        });

                    }
                });
            }
        });
    }
    else{
        return res.redirect('/users/login')
    }
});






router.get('/course/:course_id/qa', function(req, res){
    if(req.user) {

        connection.query("SELECT * FROM USER WHERE id = ? AND Role = ?",[req.user, 'Instructor'] ,function(err1,rows1){
            if(err1) {
                console.log(err1);
                res.redirect('/users/login')

            }
            else {
                connection.query("SELECT * FROM INSTRUCTOR WHERE User_id = ?  ",req.user ,function(err2,rows2){
                    if(err2) {
                        console.log(err2);
                        res.redirect('/users/login')

                    }
                    else {
                        connection.query("SELECT * FROM COURSE WHERE Course_id = ?  ",req.params.course_id ,function(err3,rows3){
                            if(err3) {
                                console.log(err3);
                                res.redirect('/instructor/courses/')

                            }
                            else {

                                connection.query("SELECT * FROM ANOUNCEMENT WHERE Course_id = ?  AND Instructor_id = ? ORDER BY -Posted_on LIMIT 5",[req.params.course_id, rows2[0].Instructor_id] ,function(err4,rows4){
                                    if(err4) {
                                        console.log(err4);
                                        res.redirect('/instructor/courses/')

                                    }
                                    else {

                                        connection.query("SELECT * FROM Q_A WHERE Course_id = ? ORDER BY -Q_A_id",[req.params.course_id] ,function(err5,rows5){
                                            if(err5) {
                                                console.log(err5);
                                                res.redirect('/instructor/courses/')

                                            }
                                            else {


                                                connection.query("SELECT * FROM ANSWER WHERE Course_id = ? ORDER BY -Q_A_id",[req.params.course_id] ,function(err6,rows6){
                                                    if(err6) {
                                                        console.log(err6);
                                                        res.redirect('/instructor/courses/')

                                                    }
                                                    else {
                                                        connection.query("SELECT * FROM REPLY WHERE Course_id = ? ",[req.params.course_id] ,function(err6,reply){
                                                            if(err6) {
                                                                console.log(err6);
                                                                res.redirect('/instructor/courses/')

                                                            }
                                                            else {

                                                                console.log(rows6);
                                                                console.log(rows5);
                                                                console.log("................");
                                                                console.log(reply);
                                                                res.render('instructor/qa',{'user':rows1[0], 'instructor': rows2[0], 'course': rows3[0], 'announcements': rows4, 'q': rows5, 'a':rows6,  'r':reply });

                                                            }
                                                        });

                                                    }
                                                });





                                            }
                                        });



                                    }
                                });
                            }
                        });

                    }
                });
            }
        });
    }
    else{
        return res.redirect('/users/login')
    }
});


router.post('/course/:course_id/qa', function(req, res){
    if(req.user) {

        connection.query("SELECT * FROM USER WHERE id = ? AND Role = ?",[req.user, 'Instructor'] ,function(err1,rows1){
            if(err1) {
                console.log(err1);
                res.redirect('/users/login')

            }
            else {
                connection.query("SELECT * FROM INSTRUCTOR WHERE User_id = ?  ",req.user ,function(err2,rows2){
                    if(err2) {
                        console.log(err2);
                        res.redirect('/users/login')

                    }
                    else {
                        var subject = req.body.subject;
                        var question = req.body.question;
                        var instructor = rows2[0].Instructor_id;
                        var name = rows2[0].First_Name + ' ' + rows2[0].Last_Name;
                        if(req.body.type){
                            instructor = null;
                            name = '';
                        }

                        var data = {
                            'Question': question,
                            'Subject': subject,
                            'Student_id': null,
                            'Instructor_id': instructor,
                            'Name': name,
                            'Course_id': req.params.course_id,
                        };

                        connection.query("INSERT INTO Q_A SET ?",data ,function(err3,rows3){
                            if(err3) {
                                console.log(err3);
                                res.redirect('/instructor/courses/')

                            }
                            else {

                                console.log(rows3);
                                var url = '/instructor/course/' + req.params.course_id + '/qa';
                                req.flash('info', 'New Question Successfully Added to Q&A Section!');
                                res.redirect(url);

                            }
                        });
                    }
                });
            }
        });
    }
    else{
        return res.redirect('/users/login')
    }
});




router.post('/course/:course_id/:question_id/', function(req, res){
    if(req.user) {

        connection.query("SELECT * FROM USER WHERE id = ? AND Role = ?",[req.user, 'Instructor'] ,function(err1,rows1){
            if(err1) {
                console.log(err1);
                res.redirect('/users/login')

            }
            else {
                connection.query("SELECT * FROM INSTRUCTOR WHERE User_id = ?  ",req.user ,function(err2,rows2){
                    if(err2) {
                        console.log(err2);
                        res.redirect('/users/login')

                    }
                    else {
                        var answer = req.body.answer;
                        var instructor = rows2[0].Instructor_id;
                        var name = rows2[0].First_Name + ' ' + rows2[0].Last_Name;
                        if(req.body.type){
                            instructor = null;
                            name = '';
                        }

                        var data = {
                            'Answer': answer,
                            'Q_A_id': req.params.question_id,
                            'Instructor_id': instructor,
                            'Student_id': null,
                            'Course_id': req.params.course_id,
                            'Name': name,
                        };

                        connection.query("INSERT INTO ANSWER SET ?",data ,function(err3,rows3){
                            if(err3) {
                                console.log(err3);
                                res.redirect('/instructor/courses/')

                            }
                            else {

                                console.log(rows3);
                                var url = '/instructor/course/' + req.params.course_id + '/qa';
                                req.flash('info', 'New Answer Successfully Added to Q&A Section!');
                                res.redirect(url);

                            }
                        });
                    }
                });
            }
        });
    }
    else{
        return res.redirect('/users/login')
    }
});



router.post('/course/add/:course_id/attendence/', function(req, res){
    console.log('dsdadghsafdsfd');
    if(req.user) {

        connection.query("SELECT * FROM USER WHERE id = ? AND Role = ?",[req.user, 'Instructor'] ,function(err1,rows1){
            if(err1) {
                console.log(err1);
                res.redirect('/users/login')

            }
            else {
                connection.query("SELECT * FROM INSTRUCTOR WHERE User_id = ?  ",req.user ,function(err2,rows2){
                    if(err2) {
                        console.log(err2);
                        res.redirect('/users/login')

                    }
                    else {
                        connection.query("SELECT * FROM COURSE WHERE Course_id = ?  ",req.params.course_id ,function(err3,rows3){
                            if(err3) {
                                console.log(err3);
                                res.redirect('/instructor/courses/')

                            }
                            else {
////////////////////////////////////////////////////////////////////////////////
                                var year, month, day;
                                var dt = new Date(req.body.date);
                                year = String(dt.getFullYear());
                                month = String(dt.getMonth() + 1);
                                if (month.length == 1) {
                                    month = "0" + month;
                                }
                                day = String(dt.getDate());
                                if (day.length == 1) {
                                    day = "0" + day;
                                }
                                var dt2= year + "-" + month + "-" + day;

                                connection.query("SELECT * FROM ATTENDENCE WHERE Course_id = ? AND Date= ? ",[req.params.course_id ,dt2 ],function(err3,result){
                                    if(err3) {
                                        console.log(err3);
                                        res.redirect('/instructor/courses/')

                                    }
                                    else {
                                        if(result.length >0 )
                                        {/////////update

                                            connection.query("SELECT * FROM ATTENDENCE  WHERE Course_id = ? AND Date = ?",[req.params.course_id,dt2] ,function(err6,rows6){
                                                if(err6) {
                                                    console.log(err6);
                                                    res.redirect('/instructor/courses/')

                                                }
                                                else {

                                                    let m = req.body.att;
                                                    console.log("--------------");
                                                    console.log(m);
                                                    console.log("--------------");

                                                    for(let i=0;i<rows6.length;i++)
                                                    {console.log('aasg');



                                                        connection.query("UPDATE ATTENDENCE SET Attended = ?  where Course_id = ? and Student_id = ?  and Date = ?",[m[i],req.params.course_id,rows6[i].Student_id,dt2],function(err8,rows8){
                                                            if(err8) {
                                                                console.log(err8);
                                                                res.redirect('/instructor/courses/')

                                                            }



                                                        });

                                                    }
                                                    var url = '/instructor/course/' + req.params.course_id+ '/attendence/';
                                                    req.flash('info', 'Results of th test Successfully Updated!');
                                                    res.redirect(url);


                                                }
                                            });

                                        }
                                        else {
                                          ////create
                                            connection.query("SELECT * FROM STUDENT WHERE Student_id IN (SELECT Student_id FROM ENROLLED WHERE Course_id = ?) ORDER BY Student_id",[req.params.course_id] ,function(err6,rows6){
                                                if(err6) {
                                                    console.log(err6);
                                                    res.redirect('/instructor/courses/')

                                                }
                                                else {

                                                    let m = req.body.att;
                                                    console.log("--------------");
                                                    console.log(m);
                                                    console.log("--------------");

                                                    for(let i=0;i<rows6.length;i++)
                                                    {console.log('aasgshdggf');
                                                        let data = {
                                                            'Attended':m[i],
                                                            'Student_id': rows6[i].Student_id,
                                                            'Date' : req.body.date,
                                                            'Course_id' : req.params.course_id
                                                        };

                                                        connection.query("INSERT INTO ATTENDENCE SET ? ",data ,function(err8,rows8){
                                                            if(err8) {
                                                                console.log(err8);
                                                                res.redirect('/instructor/courses/')

                                                            }



                                                        });

                                                    }
                                                    var url = '/instructor/course/' + req.params.course_id+ '/attendence/';
                                                    req.flash('info', 'Results of th test Successfully Updated!');
                                                    res.redirect(url);


                                                }
                                            });

                                        }
                                        ////crete end


                                       }
                                    }
                                );

            /////////////////////////////////////////////////////////////////////////////////////////
                            }
                        });
                    }
                });

            }
        });

    }
    else{
        return res.redirect('/users/login')
    }
});


router.get('/course/:course_id/attendence/', function(req, res){
    if(req.user) {

        connection.query("SELECT * FROM USER WHERE id = ? AND Role = ?",[req.user, 'Instructor'] ,function(err1,rows1){
            if(err1) {
                console.log(err1);
                res.redirect('/users/login')

            }
            else {
                connection.query("SELECT * FROM INSTRUCTOR WHERE User_id = ?  ",req.user ,function(err2,rows2){
                    if(err2) {
                        console.log(err2);
                        res.redirect('/users/login')

                    }
                    else {
                        connection.query("SELECT * FROM COURSE WHERE Course_id = ?  ",req.params.course_id ,function(err3,rows3){
                            if(err3) {
                                console.log(err3);
                                res.redirect('/instructor/courses/')

                            }
                            else {

                                connection.query("SELECT * FROM ANOUNCEMENT WHERE Course_id = ?  AND Instructor_id = ? ORDER BY -Posted_on LIMIT 5",[req.params.course_id, rows2[0].Instructor_id] ,function(err4,rows4){
                                    if(err4) {
                                        console.log(err4);
                                        res.redirect('/instructor/courses/')

                                    }
                                    else {

                                        connection.query("SELECT * FROM ASSIGNMENT WHERE Course_id = ? AND Instructor_id = ?",[req.params.course_id, rows2[0].Instructor_id] ,function(err5,rows5){
                                            if(err5) {
                                                console.log(err5);
                                                res.redirect('/instructor/courses/')

                                            }
                                            else {

                                                connection.query("SELECT  DISTINCT Date  FROM ATTENDENCE WHERE Course_id = ? ORDER BY -Date",[req.params.course_id] ,function(err5,rows6){
                                                    if(err5) {
                                                        console.log(err5);
                                                        res.redirect('/instructor/courses/')

                                                    }
                                                    else {

                                                        console.log(rows6);
                                                        res.render('instructor/attendence',{'user':rows1[0], 'instructor': rows2[0], 'course': rows3[0], 'announcements': rows4, 'assignments': rows5,  messages: req.flash('info') , 'current' : new Date(), 'attendence':rows6});
                                                    }
                                                });

                                                }
                                        });
                                    }
                                });
                            }
                        });

                    }
                });
            }
        });
    }
    else{
        return res.redirect('/users/login')
    }
});


router.get('/course/:course_id/attendence/:id/details', function(req, res){
    console.log(req.params.id)
    if(req.user) {

        connection.query("SELECT * FROM USER WHERE id = ? AND Role = ?",[req.user, 'Instructor'] ,function(err1,rows1){
            if(err1) {
                console.log(err1);
                res.redirect('/users/login')

            }
            else {
                connection.query("SELECT * FROM INSTRUCTOR WHERE User_id = ?  ",req.user ,function(err2,rows2){
                    if(err2) {
                        console.log(err2);
                        res.redirect('/users/login')

                    }
                    else {
                        connection.query("SELECT * FROM COURSE WHERE Course_id = ?  ",req.params.course_id ,function(err3,rows3){
                            if(err3) {
                                console.log(err3);
                                res.redirect('/instructor/courses/')

                            }
                            else {

                                connection.query("SELECT * FROM ANOUNCEMENT WHERE Course_id = ?  AND Instructor_id = ? ORDER BY -Posted_on LIMIT 5",[req.params.course_id, rows2[0].Instructor_id] ,function(err4,rows4){
                                    if(err4) {
                                        console.log(err4);
                                        res.redirect('/instructor/courses/')

                                    }
                                    else {

                                        connection.query("SELECT * FROM ASSIGNMENT WHERE Course_id = ? AND Instructor_id = ?",[req.params.course_id, rows2[0].Instructor_id] ,function(err5,rows5){
                                            if(err5) {
                                                console.log(err5);
                                                res.redirect('/instructor/courses/')

                                            }
                                            else {
                                                console.log("+++");
                                                var year, month, day;
                                                var dt = new Date(req.params.id);
                                                year = String(dt.getFullYear());
                                                month = String(dt.getMonth() + 1);
                                                if (month.length == 1) {
                                                    month = "0" + month;
                                                }
                                                day = String(dt.getDate());
                                                if (day.length == 1) {
                                                    day = "0" + day;
                                                }
                                                var dt2= year + "-" + month + "-" + day;

                                                // var dt2=dt.toISOString().substring(0, 10);
                                                console.log(dt2);

                                                connection.query("Select * from (select * FROM ATTENDENCE  where Course_id = ? AND Date = ? )A INNER JOIN STUDENT ON STUDENT.Student_id=A.Student_id ORDER BY A.Student_id ",[req.params.course_id , dt2 ] ,function(err5,rows6){
                                                    if(err5) {
                                                        console.log(err5);
                                                        res.redirect('/instructor/courses/')

                                                    }
                                                    else {
                                                        console.log("---");
                                                        console.log(rows6);
                                                        console.log("---");
                                                        res.render('instructor/add_attendence',{'user':rows1[0], 'instructor': rows2[0], 'course': rows3[0], 'announcements': rows4, 'assignments': rows5,  messages: req.flash('info') , 'current' : new Date(), 'attendence':rows6 ,'create':0});
                                                    }
                                                });

                                            }
                                        });
                                    }
                                });
                            }
                        });

                    }
                });
            }
        });
    }
    else{
        return res.redirect('/users/login')
    }
});




router.get('/course/:course_id/add_attendence/', function(req, res){
    if(req.user) {

        connection.query("SELECT * FROM USER WHERE id = ? AND Role = ?",[req.user, 'Instructor'] ,function(err1,rows1){
            if(err1) {
                console.log(err1);
                res.redirect('/users/login')

            }
            else {
                connection.query("SELECT * FROM INSTRUCTOR WHERE User_id = ?  ",req.user ,function(err2,rows2){
                    if(err2) {
                        console.log(err2);
                        res.redirect('/users/login')

                    }
                    else {
                        connection.query("SELECT * FROM COURSE WHERE Course_id = ?  ",req.params.course_id ,function(err3,rows3){
                            if(err3) {
                                console.log(err3);
                                res.redirect('/instructor/courses/')

                            }
                            else {

                                connection.query("SELECT * FROM ANOUNCEMENT WHERE Course_id = ?  AND Instructor_id = ? ORDER BY -Posted_on LIMIT 5",[req.params.course_id, rows2[0].Instructor_id] ,function(err4,rows4){
                                    if(err4) {
                                        console.log(err4);
                                        res.redirect('/instructor/courses/')

                                    }
                                    else {

                                        connection.query("SELECT * FROM ASSIGNMENT WHERE Course_id = ? AND Instructor_id = ?",[req.params.course_id, rows2[0].Instructor_id] ,function(err5,rows5){
                                            if(err5) {
                                                console.log(err5);
                                                res.redirect('/instructor/courses/')

                                            }
                                            else {

                                                connection.query("SELECT * FROM ENROLLED, STUDENT WHERE ENROLLED.Course_id = ? AND STUDENT.Student_id = ENROLLED.Student_id",[req.params.course_id, req.params.course_id] ,function(err5,rows6){
                                                    if(err5) {
                                                        console.log(err5);
                                                        res.redirect('/instructor/courses/')

                                                    }
                                                    else {

                                                        console.log(rows6);
                                                        res.render('instructor/add_attendence',{'user':rows1[0], 'instructor': rows2[0], 'course': rows3[0], 'announcements': rows4, 'assignments': rows5,  messages: req.flash('info') , 'current' : new Date(), 'attendence':rows6 ,'create':1});
                                                    }
                                                });

                                            }
                                        });
                                    }
                                });
                            }
                        });

                    }
                });
            }
        });
    }
    else{
        return res.redirect('/users/login')
    }
});






router.post('/course/:course_id/:question_id/:answer_id', function(req, res){
    if(req.user) {

        connection.query("SELECT * FROM USER WHERE id = ? AND Role = ?",[req.user, 'Instructor'] ,function(err1,rows1){
            if(err1) {
                console.log(err1);
                res.redirect('/users/login')

            }
            else {
                connection.query("SELECT * FROM INSTRUCTOR WHERE User_id = ?  ",req.user ,function(err2,rows2){
                    if(err2) {
                        console.log(err2);
                        res.redirect('/users/login')

                    }
                    else {
                        var Reply = req.body.answer;
                        var instructor = rows2[0].Instructor_id;
                        var name = rows2[0].First_Name + ' ' + rows2[0].Last_Name;
                        if(req.body.type){
                            instructor = null;
                            name = '';
                        }

                        var data = {
                            'Reply': Reply,
                            'Q_A_id': req.params.question_id,
                            'Instructor_id': instructor,
                            'Student_id': null,
                            'Course_id': req.params.course_id,
                            'Name': name,
                            'Answer_id':req.params.answer_id
                        };

                        connection.query("INSERT INTO  REPLY SET ?",data ,function(err3,rows3){
                            if(err3) {
                                console.log(err3);
                                res.redirect('/instructor/courses/')

                            }
                            else {

                                console.log(rows3);
                                var url = '/instructor/course/' + req.params.course_id + '/qa';
                                req.flash('info', 'New Reply Successfully Added to Q&A Section!');
                                res.redirect(url);

                            }
                        });
                    }
                });
            }
        });
    }
    else{
        return res.redirect('/users/login')
    }
});




module.exports = router;