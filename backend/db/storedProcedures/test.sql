DELIMITER $$

CREATE PROCEDURE order_placement (
    IN p_warehouse_id INT,
    IN p_product_id INT,
    IN p_customer_name VARCHAR(100),
    IN p_quantity INT,
    INOUT p_order_id INT   
)
BEGIN
    DECLARE warehouse_exists INT;
    DECLARE product_exists INT;
    DECLARE stock_available INT;
    DECLARE order_exists INT;
    DECLARE error_msg VARCHAR(255);

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    SELECT COUNT(*) INTO warehouse_exists
    FROM warehouses
    WHERE warehouse_id = p_warehouse_id;

    IF warehouse_exists = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Warehouse does not exist!';
    END IF;

    SELECT COUNT(*) INTO product_exists
    FROM products
    WHERE product_id = p_product_id;

    IF product_exists = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Product does not exist!';
    END IF;

    SELECT quantity INTO stock_available
    FROM warehouse_stock
    WHERE warehouse_id = p_warehouse_id
      AND product_id = p_product_id;

    IF stock_available IS NULL OR stock_available < p_quantity THEN
        SET error_msg = CONCAT('Insufficient stock for product_id ', p_product_id);
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = error_msg;
    END IF;

    IF p_order_id IS NULL THEN
        
        INSERT INTO orders (
            customer_name,
            order_date,
            warehouse_id,
            status
        )
        VALUES (
            p_customer_name,
            NOW(),
            p_warehouse_id,
            'PLACED'
        );

        SET p_order_id = LAST_INSERT_ID();

    ELSE
        SELECT COUNT(*) INTO order_exists
        FROM orders
        WHERE order_id = p_order_id;

        IF order_exists = 0 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Order ID does not exist!';
        END IF;

    END IF;

    INSERT INTO order_items (
        order_id,
        product_id,
        quantity,
        price
    )
    SELECT
        p_order_id,
        p_product_id,
        p_quantity,
        price
    FROM products
    WHERE product_id = p_product_id;

    UPDATE warehouse_stock
    SET quantity = quantity - p_quantity
    WHERE warehouse_id = p_warehouse_id
      AND product_id = p_product_id;

    COMMIT;

END $$

DELIMITER ;