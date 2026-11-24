import type { IDemoDTO } from '../types/IDemoDTO';
import { apiFetch } from '~/src/app/providers/api/apiFetch';

class DemoService {
  getList() {
    return apiFetch<IDemoDTO[]>('/demo/list');
  }
}

export const demoService = new DemoService();
