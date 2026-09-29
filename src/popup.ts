import { isEnabled, setEnabled } from './settings';

const toggle = document.getElementById('enabled') as HTMLInputElement;
const status = document.getElementById('status') as HTMLElement;

function render(enabled: boolean): void {
  toggle.checked = enabled;
  status.textContent = enabled ? 'Chat and chat alerts are blocked.' : 'Chat is working normally.';
}

isEnabled().then(render);
toggle.addEventListener('change', () => {
  render(toggle.checked);
  setEnabled(toggle.checked);
});
