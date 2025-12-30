import { Request, Response } from 'express';
import { EVMEngine, EVMInput } from './engines/evm.engine';

export class CostsController {
  static calculateEVM(req: Request, res: Response) {
    try {
      const input: EVMInput = req.body;
      // Basic validation
      if (input.budgetAtCompletion === undefined || input.plannedValue === undefined || 
          input.earnedValue === undefined || input.actualCost === undefined) {
        return res.status(400).json({ message: 'Missing required EVM parameters' });
      }

      const metrics = EVMEngine.calculate(input);
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: 'Error calculating EVM', error });
    }
  }
}
