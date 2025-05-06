CREATE DATABASE IF NOT EXISTS vibetunes;
USE vibetunes;

CREATE TABLE IF NOT EXISTS songs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    song_name VARCHAR(255) NOT NULL,
    genre VARCHAR(100),
    mood VARCHAR(100),
    pace VARCHAR(50),
    duration_minutes FLOAT(5,2),
    file_url VARCHAR(255)
);
