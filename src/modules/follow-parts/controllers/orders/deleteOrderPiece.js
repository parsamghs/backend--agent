const { deleteOrderPieceService } = require('../../services/orders/deleteOrderPiece');

exports.deleteOrderPiece = async (req, res) => {
  
    const { order_id } = req.params;

    const result = await deleteOrderPieceService(req.user.id, order_id);

    res.status(result.status).json({ message: result.message });
};
