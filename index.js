const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
let multer = require('multer');
const fs = require('fs')

// Creating the Express server
const app = express();

// Server configuration
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: false }));

app.use( express.static( "uploads" ) );
app.use('/uploads/image/', express.static('image'));



const storage4img = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/image/')

    },
    filename: (req, file, cb) => {
        let fileNomanclature =  Date.now()+'-'+ file.originalname
        cb(null, fileNomanclature.replace(/\s/g, '') )
    }
})



const storage4audio = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, './uploads/audio/')

  },
  filename: (req, file, cb) => {
      let fileNomanclature =  Date.now()+'-'+ file.originalname
      cb(null, fileNomanclature.replace(/\s/g, '') )
  }
})


const storage4video = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, './uploads/video/')

  },
  filename: (req, file, cb) => {
    let fileNomanclature =  Date.now()+'-'+ file.originalname
    cb(null, fileNomanclature.replace(/\s/g, '') )
}
})




//aqui define o storage
const upload4img = multer({ storage: storage4img })
const upload4audio = multer({ storage: storage4audio })
const upload4video = multer({ storage: storage4video })



// Connection to the SQlite database
const db_name = path.join(__dirname, "data", "apptest.db");
const db = new sqlite3.Database(db_name, err => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Successful connection to the database 'apptest.db'");
});

// Creating the Books table (Book_ID, Title, Author, Comments,Url)
const sql_create_books = `CREATE TABLE IF NOT EXISTS Books (
  Book_ID INTEGER PRIMARY KEY AUTOINCREMENT,
  Title VARCHAR(100) NOT NULL,
  Author VARCHAR(100) NOT NULL,
  Comments TEXT,
  Url TEXT
);`;



// Creating the Audios table (Audio_ID, Title, Artist, Comments, Url)
const sql_create_audio = `CREATE TABLE IF NOT EXISTS Audios (
  Audio_ID INTEGER PRIMARY KEY AUTOINCREMENT,
  Title VARCHAR(100) NOT NULL,
  Artist VARCHAR(100) NOT NULL,
  Comments TEXT,
  Url TEXT
);`;



// Creating the Videos table (Video_ID, Title, Owner, Comments, Url)
const sql_create_videos = `CREATE TABLE IF NOT EXISTS Videos (
  Video_ID INTEGER PRIMARY KEY AUTOINCREMENT,
  Title VARCHAR(100) NOT NULL,
  Owner VARCHAR(100) NOT NULL,
  Comments TEXT,
  Url TEXT
);`;

///////////////////////// queries ////////////////////////////////////

// cria tabela books e popula com 3 dados
db.run(sql_create_books, err => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Successful creation of the 'Books' table");
  // Database seeding
  const sql_insert = `INSERT INTO Books (Book_ID, Title, Author, Comments, Url) VALUES
  (1, 'Star Wars: The Jedi Path', 'Daniel Wallace', 'Livro de 2010', 'sem imagem'),
  (2, 'Mestres do Capitalismo', 'Nando Moura', 'Livro sobre dinheiro ' ,'sem imagem'),
  (3, 'The Elder Scrolls: The Official Cookbook', 'Chelsea Monroe-Cassel', 'Sounds Nice', 'sem imagem');`;
  db.run(sql_insert, err => {
    if (err) {
      return console.error(err.message);
    }
    console.log("Successful creation of 3 books");
  });
});

// cria tabela audio e popula com 3 dados
db.run(sql_create_audio, err => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Successful creation of the 'Audios' table");
  // Database seeding
  const sql_insert = `INSERT INTO Audios (Audio_ID, Title, Artist, Comments, Url) VALUES
  (1, 'UpBeat Music: 1', 'NCS', 'Para Entrevistas', 'sem audio'),
  (2, 'Jingle: Upbeat', 'NCS', 'Boa para Intro ' ,'sem audio'),
  (3, 'Sirene', 'Policia', 'Muito Alto', 'sem audio');`;
  db.run(sql_insert, err => {
    if (err) {
      return console.error(err.message);
    }
    console.log("Successful creation of 3 audios");
  });
});

// cria tabela video e popula com 3 dados
db.run(sql_create_videos, err => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Successful creation of the 'Video' table");
  // Database seeding
  const sql_insert = `INSERT INTO Videos (Video_ID, Title, Owner, Comments, Url) VALUES
  (1, 'Mandalorian Trailer', 'Disney', 'Mandalorian Season 2', 'sem vídeo'),
  (2, 'Videos de Skyline GTR', 'Honda', 'Comercial Nissan ' ,'sem vídeo'),
  (3, 'Trailer Gameplay', 'EA France', '4 million views', 'sem vídeo');`;
  db.run(sql_insert, err => {
    if (err) {
      return console.error(err.message);
    }
    console.log("Successful creation of 3 videos");
  });
});




// GET /
app.get("/", (req, res) => {
  res.render("index");
});




/*
////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////video//////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////
*/
// GET /video
app.get("/video", (req, res) => {
  const sql = "SELECT * FROM Videos ORDER BY Title";
  db.all(sql, [], (err, rows) => {
    if (err) {
      return console.error(err.message);
    }
    res.render("video", { model: rows });
  });
});


// GET /create_video
app.get("/video/create_video", (req, res) => {
  res.render("create_video", {model: {} , file: {} });
});



app.post('/video/create_video',upload4video.single('Url'), (req, res) => {

  const sql = "INSERT INTO Videos (Title, Owner, Comments, Url) VALUES (?, ?, ?, ?)";
  const audio = [req.body.Title, req.body.Owner, req.body.Comments, req.file.filename];
  db.run(sql, audio, err => {
    if (err) {
      return console.error(err.message);
    }
    console.log(req.body, req.file)
    res.redirect("/video");
  });
})




// GET /edit/5
app.get("/video/edit_video/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM Videos WHERE Video_ID = ?";
  db.get(sql, id, (err, row) => {
    if (err) {
      return console.error(err.message);
    }
    res.render("edit_video", { model: row });
  });
});

// POST /edit/id

app.post("/video/edit_video/:id", upload4video.single('Url'), (req, res) => {
  const id = req.params.id;
  const video = [req.body.Title, req.body.Owner, req.body.Comments, req.file.filename, id];
  const sql = "UPDATE Videos SET Title = ?, Owner = ?, Comments = ?, Url = ? WHERE (Video_ID = ?)";
  db.run(sql, video, err => {
    if (err) {
      return console.error(err.message);
    }
    console.log(req.body, req.file)
    res.redirect("/video");
  });
});



// GET /delete/id
app.get("/video/delete_video/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM Videos WHERE Video_ID = ?";
  db.get(sql, id, (err, row) => {
    if (err) {
      return console.error(err.message);
    }
    res.render("delete_video", { model: row });
  });
});


// POST /delete/id
app.post("/video/delete_video/:id", upload4video.single('Url'), (req, res) => {
  const id = req.params.id;

  const sql0 = 'SELECT Url from Videos where Video_ID = ?'
  db.get(sql0, [id], (err, row) => {
    if (err) {
      return console.error(err.message);
    }
    let path = './uploads/video/'+row.Url

    fs.unlink(path, (err) => {
      if (err) {
        console.error(err)
        return
      }
      console.log('video file removed')
    })
  
  });
  const sql = "DELETE FROM Videos WHERE Video_ID = ?";
  db.run(sql, id, err => {
    if (err) {
      return console.error(err.message);
    }
    res.redirect("/video");
  });
});


/*
////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////audio//////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////
*/

// GET /audio
app.get("/audio", (req, res) => {
  const sql = "SELECT * FROM Audios ORDER BY Title";
  db.all(sql, [], (err, rows) => {
    if (err) {
      return console.error(err.message);
    }
    res.render("audio", { model: rows });
  });
});



// GET /create_audio
app.get("/audio/create_audio", (req, res) => {
  res.render("create_audio", {model: {} , file: {} });
});



app.post('/audio/create_audio',upload4audio.single('Url'), (req, res) => {

  const sql = "INSERT INTO Audios (Title, Artist, Comments, Url) VALUES (?, ?, ?, ?)";
  const audio = [req.body.Title, req.body.Artist, req.body.Comments, req.file.filename];
  db.run(sql, audio, err => {
    if (err) {
      return console.error(err.message);
    }
    console.log(req.body, req.file)
    res.redirect("/audio");
  });
})



// GET /edit/5
app.get("/audio/edit_audio/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM Audios WHERE Audio_ID = ?";
  db.get(sql, id, (err, row) => {
    if (err) {
      return console.error(err.message);
    }
    res.render("edit_audio", { model: row });
  });
});

// POST /edit/id

app.post("/audio/edit_audio/:id", upload4audio.single('Url'), (req, res) => {
  const id = req.params.id;
  const book = [req.body.Title, req.body.Artist, req.body.Comments, req.file.filename, id];
  const sql = "UPDATE Audios SET Title = ?, Artist = ?, Comments = ?, Url = ? WHERE (Audio_ID = ?)";
  db.run(sql, book, err => {
    if (err) {
      return console.error(err.message);
    }
    console.log(req.body, req.file)
    res.redirect("/audio");
  });
});



// GET /delete/id
app.get("/audio/delete_audio/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM Audios WHERE Audio_ID = ?";
  db.get(sql, id, (err, row) => {
    if (err) {
      return console.error(err.message);
    }
    res.render("delete_audio", { model: row });
  });
});


// POST /delete/id
app.post("/audio/delete_audio/:id", upload4audio.single('Url'), (req, res) => {
  const id = req.params.id;

  const sql0 = 'SELECT Url from Audios where Audio_ID = ?'
  db.get(sql0, [id], (err, row) => {
    if (err) {
      return console.error(err.message);
    }
    let path = './uploads/audio/'+row.Url

    fs.unlink(path, (err) => {
      if (err) {
        console.error(err)
        return
      }
      console.log('audio file removed')
    })
  
  });


  const sql = "DELETE FROM Audios WHERE Audio_ID = ?";
  db.run(sql, id, err => {
    if (err) {
      return console.error(err.message);
    }
    res.redirect("/audio");
  });
});


/*
////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////books//////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////
*/


// GET /books
app.get("/books", (req, res) => {
  const sql = "SELECT * FROM Books ORDER BY Title";
  db.all(sql, [], (err, rows) => {
    if (err) {
      return console.error(err.message);
    }
    res.render("books", { model: rows });
  });
});

// GET /create
app.get("/books/create", (req, res) => {
  res.render("create", {model: {} , file: {} });
});




app.post('/books/create',upload4img.single('Url'), (req, res) => {

    const sql = "INSERT INTO Books (Title, Author, Comments, Url) VALUES (?, ?, ?, ?)";
    const book = [req.body.Title, req.body.Author, req.body.Comments, req.file.filename];
    db.run(sql, book, err => {
      if (err) {
        return console.error(err.message);
      }
      console.log(req.body, req.file)
      res.redirect("/books");
    });


})


// GET /edit/5
app.get("/books/edit/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM Books WHERE Book_ID = ?";
  db.get(sql, id, (err, row) => {
    if (err) {
      return console.error(err.message);
    }
    res.render("edit", { model: row });
  });
});

// POST /edit/id

app.post("/books/edit/:id", upload4img.single('Url'), (req, res) => {
  const id = req.params.id;
  const book = [req.body.Title, req.body.Author, req.body.Comments, req.file.filename, id];
  const sql = "UPDATE Books SET Title = ?, Author = ?, Comments = ?, Url = ? WHERE (Book_ID = ?)";
  db.run(sql, book, err => {
    if (err) {
      return console.error(err.message);
    }
    console.log(req.body, req.file)
    res.redirect("/books");
  });
});

// GET /delete/id
app.get("/books/delete/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM Books WHERE Book_ID = ?";
  db.get(sql, id, (err, row) => {
    if (err) {
      return console.error(err.message);
    }
    res.render("delete", { model: row });
  });
});


// POST /delete/id
app.post("/books/delete/:id", upload4img.single('Url'), (req, res) => {
  const id = req.params.id;

  const sql0 = 'SELECT Url from Books where Book_ID = ?'
  db.get(sql0, [id], (err, row) => {
    if (err) {
      return console.error(err.message);
    }
    let path = './uploads/image/'+row.Url

    fs.unlink(path, (err) => {
      if (err) {
        console.error(err)
        return
      }
      console.log('image file removed')
    })
  
  });


  const sql = "DELETE FROM Books WHERE Book_ID = ?";
  db.run(sql, id, err => {
    if (err) {
      return console.error(err.message);
    }
    res.redirect("/books");
  });
});








// Starting the server
app.listen(3000, () => {
  console.log("Server started (http://localhost:3000/) !");
});
