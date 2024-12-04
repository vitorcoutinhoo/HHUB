CREATE DATABASE IF NOT EXISTS hotel_hub; 

USE hotel_hub;

CREATE TABLE CLIENTE (
    id_cliente INT NOT NULL,
    user_name VARCHAR(255),
	nome_completo VARCHAR(100),
	cpf VARCHAR(20) UNIQUE,
	idade INTEGER,
	senha VARCHAR(100),
	email VARCHAR(100),
    telefone VARCHAR(100),
	PRIMARY KEY(id_cliente)
);

CREATE TABLE HOTEL (
    id_hotel INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    nome_hotel VARCHAR (15) NOT NULL,
    telefone_hotel  VARCHAR (15) NOT NULL,
    estado_hotel  VARCHAR (15) NOT NULL,
    cidade_hotel VARCHAR (15) NOT NULL,
    endereco_hotel VARCHAR(50) NOT NULL
);

CREATE TABLE QUARTO (
    id_quarto INT PRIMARY KEY AUTO_INCREMENT,
    fk_id_hotel INT NOT NULL,
    numeroQuarto VARCHAR(10) NOT NULL,
    tipoQuarto VARCHAR(50) NOT NULL, 
    statusQuarto VARCHAR(20) NOT NULL,
    valor_quarto DECIMAL,
    FOREIGN KEY (fK_id_hotel) REFERENCES HOTEL(id_hotel) ON DELETE CASCADE
);

CREATE TABLE METODO_PAGAMENTO (
    id_metodo_pagamento INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    tipoPagamento VARCHAR(10)
);

CREATE TABLE RESERVA (
    id_reserva INT PRIMARY KEY AUTO_INCREMENT,
    fK_id_cliente INT NOT NULL,
    fK_id_quarto INT NOT NULL,
    dataCheckIn DATE NOT NULL,
    dataCheckOut DATE NOT NULL,
    statusReserva VARCHAR(20) NOT NULL,
    FOREIGN KEY (fK_id_quarto) REFERENCES QUARTO(id_quarto) ON DELETE CASCADE,
    FOREIGN KEY (fK_id_cliente) REFERENCES CLIENTE(id_cliente) ON DELETE CASCADE
);

CREATE TABLE PAGAMENTO_RECEBIMENTO (
	id_fatura INT PRIMARY KEY AUTO_INCREMENT,
    fK_reserva INT NOT NULL,
    fK_metodo_pagamento INT NOT NULL,
    data_emissao DATE NOT NULL,
    valor_fatura DECIMAL,
    FOREIGN KEY (fK_reserva) REFERENCES RESERVA(id_reserva) ON DELETE CASCADE,
    FOREIGN KEY (fk_metodo_pagamento) REFERENCES METODO_PAGAMENTO(id_metodo_pagamento) ON DELETE CASCADE
)



INSERT INTO CLIENTE (id_cliente, user_name, nome_completo, cpf, idade, senha, email, telefone)
VALUES 
(1, 'johndoe', 'John Doe', '123.456.789-00', 30, 'senha123', 'johndoe@example.com', '999999999'),
(2, 'janedoe', 'Jane Doe', '987.654.321-00', 28, 'senha456', 'janedoe@example.com', '988888888'),
(3, 'pedro123', 'Pedro Silva', '111.222.333-44', 35, 'senha789', 'pedro.silva@example.com', '977777777'),
(4, 'luan.martins', 'Luan Martins', '555.444.333-22', 40, 'senha321', 'luan.martins@example.com', '966666666'),
(5, 'luciana.p', 'Luciana Pereira', '777.888.999-00', 32, 'senha654', 'luciana.pereira@example.com', '955555555');


-- Inserir dados na tabela HOTEL
INSERT INTO HOTEL (nome_hotel, telefone_hotel, estado_hotel, cidade_hotel, endereco_hotel)
VALUES
('Hotel Central', '123456789', 'São Paulo', 'São Paulo', 'Rua Central, 123'),
('Hotel Paraíso', '987654321', 'Rio de Janeiro', 'Rio de Janeiro', 'Av. Paraíso, 456'),
('Hotel Mar', '111223344', 'Bahia', 'Salvador', 'Rua Vista Mar, 789'),
('Hotel Sol', '222334455', 'Minas Gerais', 'Belo Horizonte', 'Rua Sol, 321'),
('Hotel Verde', '333445566', 'Espírito Santo', 'Vitória', 'Avenida Verde, 987');


-- Inserir dados na tabela QUARTO
INSERT INTO QUARTO (fk_id_hotel, numeroQuarto, tipoQuarto, statusQuarto, valor_quarto)
VALUES
(6, '101', 'Standard', 'Disponível', 200.00),
(6, '102', 'Luxo', 'Ocupado', 350.00),
(7, '201', 'Familiar', 'Disponível', 250.00),
(8, '301', 'Suíte', 'Disponível', 400.00),
(9, '401', 'Executivo', 'Ocupado', 300.00);


ALTER TABLE RESERVA DROP FOREIGN KEY reserva_ibfk_2;

ALTER TABLE CLIENTE MODIFY id_cliente INT AUTO_INCREMENT;

ALTER TABLE RESERVA 
ADD CONSTRAINT reserva_ibfk_2 
FOREIGN KEY (fk_id_cliente) 
REFERENCES CLIENTE(id_cliente)
ON DELETE CASCADE;

ALTER TABLE QUARTO ADD COLUMN descricao VARCHAR(255) AFTER valor_quarto;
SET SQL_SAFE_UPDATES = 0;

UPDATE QUARTO
SET descricao = 'Quarto simples e confortável, ideal para estadias curtas.'
WHERE tipoQuarto = 'Standard';

UPDATE QUARTO
SET descricao = 'Quarto luxuoso com vista panorâmica e amenities premium.'
WHERE tipoQuarto = 'Luxo';

UPDATE QUARTO
SET descricao = 'Quarto espaçoso para famílias, com camas adicionais disponíveis.'
WHERE tipoQuarto = 'Familiar';

UPDATE QUARTO
SET descricao = 'Suíte exclusiva com jacuzzi e sala de estar integrada.'
WHERE tipoQuarto = 'Suíte';

UPDATE QUARTO
SET descricao = 'Quarto executivo ideal para viagens de negócios, com estação de trabalho.'
WHERE tipoQuarto = 'Executivo';

SET SQL_SAFE_UPDATES = 1;
