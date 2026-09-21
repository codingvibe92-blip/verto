import { Router } from 'express';
import { CustomerController } from '../controllers/customer.controller';
import { authenticate, authorizePermission } from '../middleware/auth';

const router = Router();

// Customer portal
router.get('/customers/me', authenticate, CustomerController.getMyProfile);
router.post('/customers/:customerId/addresses', authenticate, CustomerController.addAddress);
router.delete('/customers/:customerId/addresses/:addressId', authenticate, CustomerController.deleteAddress);

// Admin CRM
router.get('/customers', authenticate, authorizePermission('customers.view'), CustomerController.listCustomers);
router.get('/customers/:id', authenticate, authorizePermission('customers.view'), CustomerController.getCustomer);

export default router;
