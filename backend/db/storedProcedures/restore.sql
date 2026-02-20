DELIMITER $$

CREATE PROCEDURE order_cancellation (
    IN p_order_id INT
)
BEGIN
    DECLARE order_status ENUM('PLACED','CANCELLED','COMPLETED');
    DECLARE order_exists INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    SELECT COUNT(*) INTO order_exists
    FROM orders
    WHERE order_id = p_order_id;

    IF order_exists = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Order does not exist!';
    END IF;

    SELECT status INTO order_status
    FROM orders
    WHERE order_id = p_order_id;

    IF order_status <> "PLACED" THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Only PLACED orders can be cancelled!';
    END IF;

    UPDATE orders
    SET status = "CANCELLED"
    WHERE order_id = p_order_id;

    UPDATE warehouse_stock ws
    JOIN orders o
    ON o.warehouse_id = ws.warehouse_id
    JOIN order_items oi
    ON o.order_id = oi.order_id
    SET ws.quantity = ws.quantity + oi.quantity
    WHERE o.order_id = p_order_id
    AND oi.product_id = ws.product_id;

    COMMIT;
END $$

DELIMITER ;
