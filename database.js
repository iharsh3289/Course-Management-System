var mysql = require('mysql');
var db;

function connectDatabase() {
    if (!db) {
        db = mysql.createConnection({
            host     : 'localhost',
            user     : 'root',
            password : '',
            database : 'DBMS'
        });

        db.connect(function(err){
            if(!err) {

                let createTodos1 = `CREATE TABLE if not exists USER ( 
                id INT NOT NULL AUTO_INCREMENT,  
                email varchar(100) COLLATE utf8_unicode_ci NOT NULL UNIQUE, 
                password varchar(255) COLLATE utf8_unicode_ci NOT NULL, 
                created datetime NOT NULL,
                role varchar(100),
                PRIMARY KEY(id)) 
                ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci`;

                db.query(createTodos1, function(err, results, fields) {
                    if (err) {
                        console.log(err.message);
                    }
                    console.log('User table created');
                });



                let createTodos3 = `CREATE TABLE if not exists STUDENT
                (
                  Student_id INT NOT NULL AUTO_INCREMENT,
                  First_Name VARCHAR(255),
                  Middle_Name VARCHAR(255),
                  Last_Name VARCHAR(255),
                  User_id INT NOT NULL,
                  Email VARCHAR(255),
                  Phone_Number NUMERIC(11),
                  Roll_Number VARCHAR(255),
                  PRIMARY KEY (Student_id),
                  FOREIGN KEY (User_id) REFERENCES USER(id) ON DELETE CASCADE
                ) 
                ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci`;

                db.query(createTodos3, function(err, results, fields) {
                    if (err) {
                        console.log(err.message);
                    }
                    console.log('Student table created');
                });




                let createTodos4 = `CREATE TABLE if not exists INSTRUCTOR
                (
                  Instructor_id INT NOT NULL AUTO_INCREMENT,
                  User_id INT NOT NULL,
                  First_Name VARCHAR(255),
                  Last_Name VARCHAR(255),
                  Middle_Name VARCHAR(255),
                  Email VARCHAR(255),
                  Phone_Number NUMERIC(11),
                  Department_id INT,
                  PRIMARY KEY (Instructor_id),
                  FOREIGN KEY (User_id) REFERENCES USER(id) ON DELETE CASCADE
                ) 
                ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci`;

                db.query(createTodos4, function(err, results, fields) {
                    if (err) {
                        console.log(err.message);
                    }
                    console.log('Instructor table created');
                });






                let createTodos5 = `CREATE TABLE if not exists COURSE
                (
                  Course_id INT NOT NULL AUTO_INCREMENT,
                  Course_Title VARCHAR(255) NOT NULL,
                  Course_Code VARCHAR(255) NOT NULL,
                  Instructor_id INT NOT NULL,
                  Department_id INT,
                  Introduction TEXT,
                  Description TEXT,
                  Requirements TEXT,
                  PRIMARY KEY (Course_id),
                  FOREIGN KEY (Instructor_id) REFERENCES INSTRUCTOR(Instructor_id)
                ) 
                ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci`;

                db.query(createTodos5, function(err, results, fields) {
                    if (err) {
                        console.log(err.message);
                    }
                    console.log('Course table created');
                });




                let createTodos6 = `CREATE TABLE if not exists COURSE_MATERIALS
                (
                  Material_id INT NOT NULL AUTO_INCREMENT,
                  Name VARCHAR(255),
                  Remark VARCHAR(255),
                  Material TEXT,
                  Course_id INT NOT NULL,
                  Instructor_id INT NOT NULL,
                  PRIMARY KEY (Material_id),
                  FOREIGN KEY (Course_id) REFERENCES COURSE(Course_id) ON DELETE CASCADE,
                  FOREIGN KEY (Instructor_id) REFERENCES INSTRUCTOR(Instructor_id)
                ) 
                ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci`;

                db.query(createTodos6, function(err, results, fields) {
                    if (err) {
                        console.log(err.message);
                    }
                    console.log('Course Material table created');
                });






                let createTodos7 = `CREATE TABLE if not exists TESTS
                (
                  Test_id INT NOT NULL AUTO_INCREMENT,
                  Test_Name VARCHAR(100),
                  Maximun_Marks INT,
                  Question_Paper TEXT,
                  Answer_Key TEXT,
                  Course_id INT NOT NULL,
                  Instructor_id INT NOT NULL,
                  Date DATE,
                  PRIMARY KEY (Test_id),
                  FOREIGN KEY (Course_id) REFERENCES COURSE(Course_id) ON DELETE CASCADE,
                  FOREIGN KEY (Instructor_id) REFERENCES INSTRUCTOR(Instructor_id)
                ) 
                ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci`;

                db.query(createTodos7, function(err, results, fields) {
                    if (err) {
                        console.log(err.message);
                    }
                    console.log('Tests table created');
                });





                let createTodos8 = `CREATE TABLE if not exists TEST_RESULTS
                (
                  Result_id INT NOT NULL AUTO_INCREMENT,
                  Marks_Obtained INT NOT NULL,
                  Test_id INT NOT NULL,
                  Student_id INT NOT NULL,
                  PRIMARY KEY (Result_id),
                  FOREIGN KEY (Test_id) REFERENCES TESTS(Test_id) ON DELETE CASCADE,
                  FOREIGN KEY (Student_id) REFERENCES STUDENT(Student_id)
                ) 
                ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci`;

                db.query(createTodos8, function(err, results, fields) {
                    if (err) {
                        console.log(err.message);
                    }
                    console.log('Test_Results table created');
                });







                let createTodos9 = `CREATE TABLE if not exists GRADE
                (
                  Grade_id INT NOT NULL AUTO_INCREMENT,
                  Grade_Obtained CHAR(1) NOT NULL,
                  Final_Consolidated_Marks INT NOT NULL,
                  Student_id INT NOT NULL,
                  Course_id INT NOT NULL,
                  PRIMARY KEY (Grade_id),
                  FOREIGN KEY (Student_id) REFERENCES STUDENT(Student_id) ON DELETE CASCADE,
                  FOREIGN KEY (Course_id) REFERENCES COURSE(Course_id) ON DELETE CASCADE
                ) 
                ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci`;

                db.query(createTodos9, function(err, results, fields) {
                    if (err) {
                        console.log(err.message);
                    }
                    console.log('Grade table created');
                });






                let createTodos10 = `CREATE TABLE if not exists ANOUNCEMENT
                (
                  Anouncement_id INT NOT NULL AUTO_INCREMENT,
                  Short_Description VARCHAR(50),
                  Anouncement_Details VARCHAR(255),
                  Link1 VARCHAR(1000),
                  Link2 VARCHAR(1000),
                  Link3 VARCHAR(1000),
                  Posted_on DATETIME,
                  Course_id INT,
                  Instructor_id INT NOT NULL,
                  PRIMARY KEY (Anouncement_id),
                  FOREIGN KEY (Course_id) REFERENCES COURSE(Course_id) ON DELETE CASCADE,
                  FOREIGN KEY (Instructor_id) REFERENCES INSTRUCTOR(Instructor_id)
                ) 
                ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci`;

                db.query(createTodos10, function(err, results, fields) {
                    if (err) {
                        console.log(err.message);
                    }
                    console.log('Announcement table created');
                });







                let createTodos11 = `CREATE TABLE if not exists Q_A
                (
                  Q_A_id INT NOT NULL AUTO_INCREMENT,
                  Question VARCHAR(1000) NOT NULL,
                  Subject VARCHAR(1000) NOT NULL,
                  Student_id INT,
                  Instructor_id INT,
                  Name VARCHAR(255),
                  Course_id INT NOT NULL,
                  PRIMARY KEY (Q_A_id),
                  FOREIGN KEY (Student_id) REFERENCES STUDENT(Student_id),
                  FOREIGN KEY (Course_id) REFERENCES COURSE(Course_id) ON DELETE CASCADE
                ) 
                ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci`;

                db.query(createTodos11, function(err, results, fields) {
                    if (err) {
                        console.log(err.message);
                    }
                    console.log('Q_A table created');
                });







                let createTodos12 = `CREATE TABLE if not exists ANSWER
                (
                  Answer_id INT NOT NULL AUTO_INCREMENT,
                  Answer VARCHAR(2500) NOT NULL,
                  Q_A_id INT NOT NULL,
                  Instructor_id INT,
                  Student_id INT,
                  Course_id INT,
                  Name VARCHAR(255),
                  PRIMARY KEY (Answer_id),
                  FOREIGN KEY (Q_A_id) REFERENCES Q_A(Q_A_id) ON DELETE CASCADE,
                  FOREIGN KEY (Instructor_id) REFERENCES INSTRUCTOR(Instructor_id),
                  FOREIGN KEY (Student_id) REFERENCES STUDENT(Student_id)
                ) 
                ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci`;

                db.query(createTodos12, function(err, results, fields) {
                    if (err) {
                        console.log(err.message);
                    }
                    console.log('Answer table created');
                });







                let createTodos13 = `CREATE TABLE if not exists ENROLLED
                (
                  Course_id INT NOT NULL,
                  Student_id INT NOT NULL,
                  PRIMARY KEY (Course_id, Student_id),
                  FOREIGN KEY (Course_id) REFERENCES COURSE(Course_id) ON DELETE CASCADE,
                  FOREIGN KEY (Student_id) REFERENCES STUDENT(Student_id) ON DELETE CASCADE
                ) 
                ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci`;

                db.query(createTodos13, function(err, results, fields) {
                    if (err) {
                        console.log(err.message);
                    }
                    console.log('Enrolled table created');
                });



                let createTodos14 = `CREATE TABLE if not exists ASSIGNMENT
                (
                  Assignment_id INT NOT NULL AUTO_INCREMENT,
                  Assignment_Name VARCHAR(100),
                  Maximun_Marks INT,
                  Assignment_File TEXT,
                  Solutions TEXT,
                  Course_id INT NOT NULL,
                  Instructor_id INT NOT NULL,
                  Date DATE,
                  PRIMARY KEY (Assignment_id),
                  FOREIGN KEY (Course_id) REFERENCES COURSE(Course_id) ON DELETE CASCADE,
                  FOREIGN KEY (Instructor_id) REFERENCES INSTRUCTOR(Instructor_id)
                ) 
                ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci`;

                db.query(createTodos14, function(err, results, fields) {
                    if (err) {
                        console.log(err.message);
                    }
                    console.log('Assignment table created');
                });



                let createTodos15 = `CREATE TABLE if not exists SUBMISSION
                (
                  Submission_id INT NOT NULL AUTO_INCREMENT,
                  Submission_File TEXT,
                  Course_id INT NOT NULL,
                  Assignment_id INT NOT NULL,
                  Student_id INT NOT NULL,
                  PRIMARY KEY (Submission_id),
                  FOREIGN KEY (Course_id) REFERENCES COURSE(Course_id) ON DELETE CASCADE,
                  FOREIGN KEY (Student_id) REFERENCES STUDENT(Student_id) ON DELETE CASCADE,
                  FOREIGN KEY (Assignment_id) REFERENCES ASSIGNMENT(Assignment_id) ON DELETE CASCADE
                ) 
                ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci`;

                db.query(createTodos15, function(err, results, fields) {
                    if (err) {
                        console.log(err.message);
                    }
                    console.log('Submission table created');
                });



                let createTodos16 = `CREATE TABLE if not exists ATTENDENCE
                (
                  Attendence_id INT NOT NULL AUTO_INCREMENT,
                  Date DATE,
                  Attended INT,
                  Course_id INT NOT NULL,
                  Student_id INT NOT NULL,
                  PRIMARY KEY (Attendence_id),
                  FOREIGN KEY (Course_id) REFERENCES COURSE(Course_id) ON DELETE CASCADE,
                  FOREIGN KEY (Student_id) REFERENCES STUDENT(Student_id) ON DELETE CASCADE
           
                ) 
                ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci`;

                db.query(createTodos16, function(err, results, fields) {
                    if (err) {
                        console.log(err.message);
                    }
                    console.log('Attendance table created');
                });


                let createTodos17 = `CREATE TABLE if not exists REPLY
                (
                  Reply_id INT NOT NULL AUTO_INCREMENT,
                  Reply VARCHAR(2500) NOT NULL,
                  Q_A_id INT NOT NULL,
                  Answer_id INT NOT NULL,
                  Instructor_id INT,
                  Student_id INT,
                  Course_id INT,
                  Name VARCHAR(255),
                  PRIMARY KEY (Reply_id),
                  FOREIGN KEY (Answer_id) REFERENCES ANSWER(Answer_id) ON DELETE CASCADE,
                  FOREIGN KEY (Q_A_id) REFERENCES Q_A(Q_A_id) ON DELETE CASCADE,
                  FOREIGN KEY (Instructor_id) REFERENCES INSTRUCTOR(Instructor_id),
                  FOREIGN KEY (Student_id) REFERENCES STUDENT(Student_id)
                ) 
                ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci`;

                db.query(createTodos17, function(err, results, fields) {
                    if (err) {
                        console.log(err.message);
                    }
                    else
                    console.log('Reply table created');
                });



                let createTodos18 = `CREATE TABLE if not exists PERMISSION
                (
                  Permission_id INT NOT NULL AUTO_INCREMENT,
                  Course_id INT NOT NULL,
                  Student_id INT,
                  PRIMARY KEY (Permission_id),
                  FOREIGN KEY (Course_id) REFERENCES COURSE(Course_id) ON DELETE CASCADE,
                  FOREIGN KEY (Student_id) REFERENCES STUDENT(Student_id)
                ) 
                ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci`;

                db.query(createTodos18, function(err, results, fields) {
                    if (err) {
                        console.log(err.message);
                    }
                    console.log('Permission table created');
                });


                let createTodos19 = `CREATE TABLE if not exists PASSWORD
                (
                  Password_id INT NOT NULL AUTO_INCREMENT,
                  User_id INT NOT NULL,
                  Secret VARCHAR(1000),
                  PRIMARY KEY (Password_id),
                  FOREIGN KEY (User_id) REFERENCES USER(id)
                ) 
                ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci`;

                db.query(createTodos19, function(err, results, fields) {
                    if (err) {
                        console.log(err.message);
                    }
                    console.log('Password table created');
                });

                let createTodos181 = `CREATE TABLE if not exists Exams
                (
                  Exam_id INT NOT NULL AUTO_INCREMENT,
                  Exam_Name VARCHAR(100),
                  Total_Questions INT,
                  Course_id INT NOT NULL,
                  Secret INT NOT NULL,
                  Instructor_id INT NOT NULL,
                  Date DATE,
                  PRIMARY KEY (Exam_id),
                  FOREIGN KEY (Course_id) REFERENCES COURSE(Course_id) ON DELETE CASCADE,
                  FOREIGN KEY (Instructor_id) REFERENCES INSTRUCTOR(Instructor_id)
                ) 
                ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci`;

                db.query(createTodos181, function(err, results, fields) {
                    if (err) {
                        console.log(err.message);
                    }
                    console.log('Exams table created');
                });




                let createTodos191 = `CREATE TABLE if not exists Questions
                (
                  Question_id INT NOT NULL AUTO_INCREMENT,
                  Question VARCHAR(100),
                  Op1 VARCHAR(100),
                  Op2 VARCHAR(100),
                  Op3 VARCHAR(100),
                  Op4 VARCHAR(100),
                  Correct_Option INT NOT NULL,
                  Exam_id INT NOT NULL,
                  Course_id INT NOT NULL,
                  Instructor_id INT NOT NULL,
                  PRIMARY KEY (Question_id),
                  FOREIGN KEY (Exam_id) REFERENCES Exams(Exam_id) ON DELETE CASCADE,
                  FOREIGN KEY (Course_id) REFERENCES COURSE(Course_id) ON DELETE CASCADE,
                  FOREIGN KEY (Instructor_id) REFERENCES INSTRUCTOR(Instructor_id)
                ) 
                ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci`;

                db.query(createTodos191, function(err, results, fields) {
                    if (err) {
                        console.log(err.message);
                    }
                    console.log('Questions table created');
                });



                let createTodos20 = `CREATE TABLE if not exists Exam_Submission
                (
                  Exam_Submission_id INT NOT NULL AUTO_INCREMENT,
                  Question_id  INT NOT NULL,
                  Answer_id INT ,
                  Mark INT,
                  Exam_id INT NOT NULL,
                  Course_id INT NOT NULL,
                  Student_id INT NOT NULL,
                  PRIMARY KEY (Exam_Submission_id),
                  FOREIGN KEY (Question_id) REFERENCES Questions(Question_id) ON DELETE CASCADE,
                  FOREIGN KEY (Exam_id) REFERENCES Exams(Exam_id) ON DELETE CASCADE,
                  FOREIGN KEY (Course_id) REFERENCES COURSE(Course_id) ON DELETE CASCADE,
                  FOREIGN KEY (Student_id) REFERENCES STUDENT(Student_id)
                ) 
                ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci`;

                db.query(createTodos20, function(err, results, fields) {
                    if (err) {
                        console.log(err.message);
                    }
                    console.log('Exam-submission table created');
                });

                db.end(function(err) {
                    if (err) {
                        return console.log(err.message);
                    }
                });

                console.log('Database is connected!');

            } else {
                throw err;
            }
        });
    }
    return db;
}

module.exports = connectDatabase();