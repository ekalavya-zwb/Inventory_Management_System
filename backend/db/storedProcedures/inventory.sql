DELIMITER $$

CREATE PROCEDURE order_placement (
    IN p_order_id INT,
    IN p_warehouse_id INT,
    IN p_product_id INT,
    IN p_quantity INT
)
BEGIN
    DECLARE product_exists INT;
    DECLARE stock_available INT;
    DECLARE error_msg VARCHAR(255);

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        RESIGNAL;
    END;

    SELECT COUNT(*) INTO product_exists
    FROM products
    WHERE product_id = p_product_id;

    IF product_exists = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Product does not exist';
    END IF;

    SELECT quantity INTO stock_available
    FROM warehouse_stock
    WHERE warehouse_id = p_warehouse_id
    AND product_id = p_product_id
    FOR UPDATE;

    IF stock_available IS NULL OR stock_available < p_quantity THEN
    SET error_msg = CONCAT('Insufficient stock for product_id ', p_product_id);
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = error_msg;
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

END $$

DELIMITER ;
