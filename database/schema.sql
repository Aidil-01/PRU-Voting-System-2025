-- ========================================
-- PRU VOTING SYSTEM DATABASE SCHEMA
-- For XAMPP MySQL Environment
-- ========================================

-- Create database
CREATE DATABASE IF NOT EXISTS pru_voting_system 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE pru_voting_system;

-- ========================================
-- VILLAGES TABLE
-- ========================================
CREATE TABLE villages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ========================================
-- POLITICAL PARTIES TABLE
-- ========================================
CREATE TABLE parties (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    abbreviation VARCHAR(10),
    color VARCHAR(7) NOT NULL DEFAULT '#3B82F6', -- Hex color code
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ========================================
-- VOTERS TABLE
-- ========================================
CREATE TABLE voters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    ic_number VARCHAR(12) NOT NULL UNIQUE, -- Malaysian IC format
    village_id INT NOT NULL,
    party_voted_id INT NULL,
    has_voted BOOLEAN DEFAULT FALSE,
    voted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (village_id) REFERENCES villages(id) ON DELETE RESTRICT,
    FOREIGN KEY (party_voted_id) REFERENCES parties(id) ON DELETE SET NULL,
    
    INDEX idx_ic_number (ic_number),
    INDEX idx_village_id (village_id),
    INDEX idx_has_voted (has_voted),
    INDEX idx_party_voted (party_voted_id)
);

-- ========================================
-- VOTE LOGS TABLE (Audit Trail)
-- ========================================
CREATE TABLE vote_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    voter_id INT NOT NULL,
    party_id INT NOT NULL,
    village_id INT NOT NULL,
    voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45), -- Support IPv6
    user_agent TEXT,
    
    FOREIGN KEY (voter_id) REFERENCES voters(id) ON DELETE CASCADE,
    FOREIGN KEY (party_id) REFERENCES parties(id) ON DELETE CASCADE,
    FOREIGN KEY (village_id) REFERENCES villages(id) ON DELETE CASCADE,
    
    INDEX idx_voted_at (voted_at),
    INDEX idx_voter_id (voter_id),
    INDEX idx_party_id (party_id),
    INDEX idx_village_id (village_id)
);

-- ========================================
-- SYSTEM SETTINGS TABLE
-- ========================================
CREATE TABLE system_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(50) NOT NULL UNIQUE,
    setting_value TEXT,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ========================================
-- INSERT DEFAULT DATA
-- ========================================

-- Default Malaysian political parties
INSERT INTO parties (name, abbreviation, color, description) VALUES
('Barisan Nasional', 'BN', '#1E40AF', 'Barisan Nasional coalition'),
('Pakatan Harapan', 'PH', '#DC2626', 'Pakatan Harapan coalition'),
('Perikatan Nasional', 'PN', '#059669', 'Perikatan Nasional coalition'),
('Parti Islam Se-Malaysia', 'PAS', '#16A34A', 'Islamic party'),
('Democratic Action Party', 'DAP', '#DC2626', 'Democratic Action Party'),
('Parti Keadilan Rakyat', 'PKR', '#2563EB', 'Peoples Justice Party'),
('Malaysian Chinese Association', 'MCA', '#1E40AF', 'Malaysian Chinese Association'),
('Malaysian Indian Congress', 'MIC', '#7C2D12', 'Malaysian Indian Congress'),
('United Malays National Organisation', 'UMNO', '#1E40AF', 'United Malays National Organisation'),
('Parti Pribumi Bersatu Malaysia', 'BERSATU', '#DC2626', 'Malaysian United Indigenous Party');

-- Sample villages
INSERT INTO villages (name, description) VALUES
('Kampung Baru', 'Traditional Malay village in the city center'),
('Taman Tun Dr Ismail', 'Residential area with mixed demographics'),
('Petaling Jaya', 'Urban township with diverse communities'),
('Shah Alam', 'State capital with industrial and residential areas'),
('Klang', 'Historic port town with diverse population'),
('Subang Jaya', 'Modern township with young professionals'),
('Cheras', 'Large residential area with various income groups'),
('Ampang', 'Mixed development area near Kuala Lumpur'),
('Puchong', 'Growing township with new developments'),
('Kajang', 'Traditional town with modern expansions');

-- System settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('voting_enabled', 'true', 'Enable or disable voting functionality'),
('max_voters', '15000', 'Maximum number of voters allowed'),
('election_name', 'Pilihan Raya Umum 2024', 'Name of the current election'),
('polling_start_time', '08:00:00', 'Voting starts at this time'),
('polling_end_time', '17:00:00', 'Voting ends at this time');

-- ========================================
-- VIEWS FOR STATISTICS
-- ========================================

-- Vote count by party
CREATE VIEW vote_stats_by_party AS
SELECT 
    p.id,
    p.name,
    p.abbreviation,
    p.color,
    COUNT(v.id) as vote_count,
    ROUND((COUNT(v.id) * 100.0 / (SELECT COUNT(*) FROM voters WHERE has_voted = TRUE)), 2) as percentage
FROM parties p
LEFT JOIN voters v ON p.id = v.party_voted_id AND v.has_voted = TRUE
GROUP BY p.id, p.name, p.abbreviation, p.color
ORDER BY vote_count DESC;

-- Vote count by village
CREATE VIEW vote_stats_by_village AS
SELECT 
    vil.id,
    vil.name,
    COUNT(v.id) as total_voters,
    COUNT(CASE WHEN v.has_voted = TRUE THEN 1 END) as votes_cast,
    ROUND((COUNT(CASE WHEN v.has_voted = TRUE THEN 1 END) * 100.0 / COUNT(v.id)), 2) as turnout_percentage
FROM villages vil
LEFT JOIN voters v ON vil.id = v.village_id
GROUP BY vil.id, vil.name
ORDER BY turnout_percentage DESC;

-- Overall statistics
CREATE VIEW overall_stats AS
SELECT 
    COUNT(*) as total_voters,
    COUNT(CASE WHEN has_voted = TRUE THEN 1 END) as total_votes_cast,
    COUNT(CASE WHEN has_voted = FALSE THEN 1 END) as remaining_voters,
    ROUND((COUNT(CASE WHEN has_voted = TRUE THEN 1 END) * 100.0 / COUNT(*)), 2) as overall_turnout_percentage
FROM voters;

-- ========================================
-- STORED PROCEDURES
-- ========================================

DELIMITER //

-- Procedure to cast a vote
CREATE PROCEDURE CastVote(
    IN p_voter_id INT,
    IN p_party_id INT,
    IN p_ip_address VARCHAR(45),
    IN p_user_agent TEXT
)
BEGIN
    DECLARE v_village_id INT;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Check if voter exists and hasn't voted
    SELECT village_id INTO v_village_id
    FROM voters 
    WHERE id = p_voter_id AND has_voted = FALSE;
    
    IF v_village_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Voter not found or has already voted';
    END IF;
    
    -- Update voter record
    UPDATE voters 
    SET party_voted_id = p_party_id, 
        has_voted = TRUE, 
        voted_at = CURRENT_TIMESTAMP 
    WHERE id = p_voter_id;
    
    -- Insert into vote log
    INSERT INTO vote_logs (voter_id, party_id, village_id, ip_address, user_agent)
    VALUES (p_voter_id, p_party_id, v_village_id, p_ip_address, p_user_agent);
    
    COMMIT;
END //

DELIMITER ;

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

-- Additional indexes for better query performance
CREATE INDEX idx_voters_name ON voters(name);
CREATE INDEX idx_parties_name ON parties(name);
CREATE INDEX idx_villages_name ON villages(name);
CREATE INDEX idx_vote_logs_timestamp ON vote_logs(voted_at);

-- ========================================
-- SAMPLE DATA FOR TESTING
-- ========================================

-- Sample voters (first 20 for testing)
INSERT INTO voters (name, ic_number, village_id) VALUES
('Ahmad bin Abdullah', '850123014567', 1),
('Siti Nurhaliza binti Mohamed', '920456789012', 2),
('Raj Kumar a/l Selvam', '880789123456', 3),
('Lim Wei Ming', '910234567890', 4),
('Fatimah binti Hassan', '870567890123', 5),
('Chen Li Hua', '930890123456', 6),
('Ravi a/l Krishnan', '860123456789', 7),
('Nurul Ain binti Omar', '940456789012', 8),
('Tan Ah Kow', '820789123456', 9),
('Zarina binti Zainal', '890234567890', 10),
('Kumar a/l Gopal', '810567890123', 1),
('Wong Mei Ling', '950890123456', 2),
('Hassan bin Ali', '870123456789', 3),
('Priya a/p Sanjay', '920456789112', 4),
('Lau Choon Heng', '881201234567', 5),
('Aminah binti Yusof', '911123456789', 6),
('Devi a/p Raman', '851012345678', 7),
('Ong Beng Huat', '931234567890', 8),
('Suraya binti Ismail', '861123456780', 9),
('Muthu a/l Raman', '941234567801', 10);

COMMIT;