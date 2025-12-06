// Simple client-side rule-based chatbot helper.
// Returns multiple answer variants and optional navigation hints.

import { calculateDaysUntilExpiry } from './utils';
import type { LocalItem } from './localInventory';

type Answer = string;
type AnswerObj = { text: string; nav?: string };

export function useChatBot() {
  const suggestions = [
    "What's expiring soon?",
    'Show my inventory',
    'Add a new item',
    'Scan page',
    'What can I cook now?'
  ];

  function askRaw(query: string, items: LocalItem[] = []) : AnswerObj[] {
    const q = query.toLowerCase();
    const answers: AnswerObj[] = [];

    if (q.includes('expiring') || q.includes('soon') || q.includes('what is expiring')) {
      const soon = items.filter(it => it.expiryDate && calculateDaysUntilExpiry(it.expiryDate) <= 3);
      if (soon.length === 0) {
        answers.push({ text: 'Nothing is expiring in the next 3 days.' });
        answers.push({ text: 'All your items look fresh for now.' });
      } else {
        answers.push({ text: `Found ${soon.length} item(s) expiring soon: ${soon.slice(0,5).map(s => s.name).join(', ')}.` });
        answers.push({ text: 'You can use them in meals or mark them as priority to cook.' });
        answers.push({ text: 'Open Inventory to manage items.', nav: '/inventory' });
      }
      return answers;
    }

    if (q.includes('inventory') || q.includes('show my inventory') || q.includes('list items')) {
      if (items.length === 0) {
        answers.push({ text: 'Your inventory is empty. Add items from the Add Item button or use the Scan page.' });
        answers.push({ text: 'Try: "Add a banana"' });
      } else {
        answers.push({ text: `You have ${items.length} items. Top items: ${items.slice(0,5).map(i => i.name).join(', ')}.` });
        answers.push({ text: 'Open the Inventory page to view and manage all items.', nav: '/inventory' });
      }
      return answers;
    }

    if (q.includes('cook') || q.includes('recipe') || q.includes('what can i cook')) {
      // naive recipe hint
      const names = items.map(i => i.name.toLowerCase());
      if (names.some(n => n.includes('banana'))) {
        answers.push({ text: 'Try a Banana Smoothie Bowl — quick and uses bananas.', nav: '/recipes/1' });
        answers.push({ text: 'Also good: Banana pancakes if you have flour and eggs.' });
      } else if (names.some(n => n.includes('spinach'))) {
        answers.push({ text: 'Spinach & Chicken Salad is a good option — uses spinach and chicken.', nav: '/recipes/2' });
      } else {
        answers.push({ text: 'No direct matches for recipes. Try scanning items or adding common ingredients.' });
      }
      return answers;
    }

    if (q.includes('scan') || q.includes('qr')) {
      answers.push({ text: 'Opening the Scan page will let you add items by barcode or QR.', nav: '/scan' });
      answers.push({ text: 'You can also scan via the Scan menu.' });
      return answers;
    }

    if (q.includes('add') && q.includes('item')) {
      answers.push({ text: 'To add an item, open the Inventory and click Add Item.', nav: '/inventory' });
      answers.push({ text: 'You can also scan the item from the Scan page.', nav: '/scan' });
      return answers;
    }

    // fallback responses
    answers.push({ text: 'I can help with inventory, recipes, scanning, and navigation. Try: "What\'s expiring soon?"' });
    answers.push({ text: 'You can ask to open pages: Inventory, Scan, Meal Planning.' });
    return answers;
  }

  // Lightweight wrapper that is client-side friendly. It reads localStorage to fetch inventory snapshot.
  function ask(query: string) : AnswerObj[] {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('vasundhara_local_inventory_v1') : null;
      const items: LocalItem[] = raw ? JSON.parse(raw) : [];
      return askRaw(query, items);
    } catch (err) {
      return [{ text: 'Sorry, I could not read inventory right now. Try again.' }];
    }
  }

  return { ask, suggestions } as const;
}

export default useChatBot;
