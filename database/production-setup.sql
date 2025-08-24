-- Production database setup for Railway MySQL
-- Run these commands after connecting to your Railway MySQL database

-- Create tables (same as development)
CREATE TABLE IF NOT EXISTS villages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS parties (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL UNIQUE,
    abbreviation VARCHAR(10),
    color VARCHAR(7) DEFAULT '#3B82F6',
    logo_path VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS voters (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    ic_number VARCHAR(12) NOT NULL UNIQUE,
    village_id INT NOT NULL,
    has_voted BOOLEAN DEFAULT FALSE,
    party_voted_id INT NULL,
    voted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (village_id) REFERENCES villages(id),
    FOREIGN KEY (party_voted_id) REFERENCES parties(id)
);

-- Create stored procedure for secure voting
DELIMITER //
CREATE PROCEDURE CastVote(
    IN voter_id INT,
    IN party_id INT,
    OUT result_code INT,
    OUT message VARCHAR(255)
)
BEGIN
    DECLARE voter_exists INT DEFAULT 0;
    DECLARE already_voted INT DEFAULT 0;
    DECLARE party_exists INT DEFAULT 0;
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET result_code = -1;
        SET message = 'Database error occurred';
    END;
    
    START TRANSACTION;
    
    -- Check if voter exists
    SELECT COUNT(*) INTO voter_exists FROM voters WHERE id = voter_id;
    
    IF voter_exists = 0 THEN
        SET result_code = 1;
        SET message = 'Voter not found';
        ROLLBACK;
    ELSE
        -- Check if voter has already voted
        SELECT has_voted INTO already_voted FROM voters WHERE id = voter_id;
        
        IF already_voted = 1 THEN
            SET result_code = 2;
            SET message = 'Voter has already voted';
            ROLLBACK;
        ELSE
            -- Check if party exists
            SELECT COUNT(*) INTO party_exists FROM parties WHERE id = party_id;
            
            IF party_exists = 0 THEN
                SET result_code = 3;
                SET message = 'Party not found';
                ROLLBACK;
            ELSE
                -- Cast the vote
                UPDATE voters 
                SET has_voted = TRUE, 
                    party_voted_id = party_id, 
                    voted_at = CURRENT_TIMESTAMP 
                WHERE id = voter_id;
                
                SET result_code = 0;
                SET message = 'Vote cast successfully';
                COMMIT;
            END IF;
        END IF;
    END IF;
END //
DELIMITER ;

-- Insert sample data for testing
INSERT INTO villages (name) VALUES 
('Kampung Baru'),
('Taman Melati'),
('Bandar Utama');

INSERT INTO parties (name, abbreviation, color, description) VALUES 
('Barisan Nasional', 'BN', '#0066CC', 'Parti politik tertua Malaysia'),
('Pakatan Harapan', 'PH', '#FF0000', 'Gabungan parti pembangkang'),
('Perikatan Nasional', 'PN', '#00AA00', 'Gabungan parti Islam');

-- Insert sample voters for testing
INSERT INTO voters (name, ic_number, village_id) VALUES 
('Ahmad bin Ali', '901234567890', 1),
('Siti Fatimah', '891234567890', 2),
('Lim Wei Ming', '851234567890', 3),
('Raj Kumar', '801234567890', 1);

SELECT 'Database setup completed successfully!' as message;