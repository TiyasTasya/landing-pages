import { Modal } from 'bootstrap';

const storageKeys = {
  categories: 'inapp.inventory.categories.v1',
  suppliers: 'inapp.inventory.suppliers.v1',
  movements: 'inapp.inventory.movements.v1',
  settings: 'inapp.inventory.settings.v1',
  profile: 'inapp.inventory.profile.v1',
  notificationsRead: 'inapp.inventory.notifications-read.v1',
};

const initialData = {
  categories: [
    { id: 'electronics', name: 'Electronics', description: 'Electronic devices and accessories', products: 8, status: 'Active' },
    { id: 'computers', name: 'Computers', description: 'Computers and peripherals', products: 2, status: 'Active' },
    { id: 'accessories', name: 'Accessories', description: 'General device accessories', products: 4, status: 'Active' },
  ],
  suppliers: [
    { id: 'tech-pro', name: 'Tech Pro', contact: '+62 21 555 0101', email: 'sales@techpro.example', products: 5, status: 'Active' },
    { id: 'brand-name', name: 'Brand Name', contact: '+62 21 555 0102', email: 'orders@brandname.example', products: 3, status: 'Active' },
  ],
  movements: [
    { id: 'movement-1', date: 'Today', product: 'Gaming Joy Stick', type: 'Stock In', quantity: 20, reference: 'PO-001', notes: 'Supplier delivery' },
    { id: 'movement-2', date: 'Today', product: 'Wireless Earphones', type: 'Stock Out', quantity: 5, reference: 'SO-014', notes: 'Customer order' },
    { id: 'movement-3', date: 'Yesterday', product: 'Smart Watch Pro', type: 'Stock In', quantity: 12, reference: 'PO-002', notes: 'Restock' },
  ],
};

function showMessage(message, isError = false) {
  let alert = document.querySelector('[data-action-message]');
  if (!alert) {
    alert = document.createElement('div');
    alert.dataset.actionMessage = '';
    alert.className = 'alert mb-3';
    alert.setAttribute('role', 'status');
    document.querySelector('#content .container-fluid')?.prepend(alert);
  }

  if (alert) {
    alert.classList.toggle('alert-danger', isError);
    alert.classList.toggle('alert-success', !isError);
    alert.textContent = message;
    window.setTimeout(() => alert.remove(), 4000);
  }
}

function readData(key, fallback) {
  const value = localStorage.getItem(key);
  if (value === null) return structuredClone(fallback);

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed) && (parsed === null || typeof parsed !== 'object')) {
      throw new TypeError('Stored value has an invalid shape.');
    }
    return parsed;
  } catch (error) {
    throw new Error(`Saved data could not be read (${key}).`, { cause: error });
  }
}

function saveData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function textCell(value) {
  const cell = document.createElement('td');
  cell.textContent = value;
  return cell;
}

function badge(label, className) {
  const span = document.createElement('span');
  span.className = `badge ${className}`;
  span.textContent = label;
  return span;
}

function actionButton(label, action, id, icon) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'btn btn-sm btn-light me-1';
  button.setAttribute('aria-label', label);
  button.dataset.action = action;
  button.dataset.id = id;
  const glyph = document.createElement('i');
  glyph.className = `ti ${icon}`;
  button.append(glyph);
  return button;
}

function renderCategories() {
  const body = document.querySelector('[data-category-table] tbody');
  if (!body) return;

  const categories = readData(storageKeys.categories, initialData.categories);
  body.replaceChildren();
  categories.forEach(category => {
    const row = document.createElement('tr');
    row.append(textCell(category.name), textCell(category.description), textCell(String(category.products)));
    const status = document.createElement('td');
    status.append(badge(category.status, category.status === 'Active' ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'));
    row.append(status);
    const actions = document.createElement('td');
    actions.append(actionButton(`Edit ${category.name}`, 'edit-category', category.id, 'ti-edit'));
    actions.append(actionButton(`Delete ${category.name}`, 'delete-category', category.id, 'ti-trash'));
    row.append(actions);
    body.append(row);
  });
}

function renderSuppliers() {
  const body = document.querySelector('[data-supplier-table] tbody');
  if (!body) return;

  const suppliers = readData(storageKeys.suppliers, initialData.suppliers);
  body.replaceChildren();
  suppliers.forEach(supplier => {
    const row = document.createElement('tr');
    row.append(textCell(supplier.name), textCell(supplier.contact), textCell(supplier.email), textCell(String(supplier.products)));
    const status = document.createElement('td');
    status.append(badge(supplier.status, supplier.status === 'Active' ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'));
    row.append(status);
    const actions = document.createElement('td');
    actions.append(actionButton(`Edit ${supplier.name}`, 'edit-supplier', supplier.id, 'ti-edit'));
    actions.append(actionButton(`Delete ${supplier.name}`, 'delete-supplier', supplier.id, 'ti-trash'));
    row.append(actions);
    body.append(row);
  });
}

function renderMovements() {
  const body = document.querySelector('[data-movement-table] tbody');
  if (!body) return;

  const movements = readData(storageKeys.movements, initialData.movements);
  body.replaceChildren();
  movements.forEach(movement => {
    const row = document.createElement('tr');
    row.append(textCell(movement.date), textCell(movement.product));
    const type = document.createElement('td');
    type.append(badge(movement.type, movement.type === 'Stock In' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'));
    const quantity = document.createElement('td');
    quantity.textContent = `${movement.type === 'Stock In' ? '+' : '-'}${movement.quantity} pcs`;
    row.append(type, quantity, textCell(movement.reference), textCell(movement.notes));
    body.append(row);
  });
}

function createModal(title, fields, values, onSubmit) {
  const wrapper = document.createElement('div');
  wrapper.className = 'modal fade';
  wrapper.tabIndex = -1;
  wrapper.setAttribute('aria-hidden', 'true');

  const dialog = document.createElement('div');
  dialog.className = 'modal-dialog modal-dialog-centered';
  const content = document.createElement('div');
  content.className = 'modal-content';
  const form = document.createElement('form');
  const header = document.createElement('div');
  header.className = 'modal-header';
  const heading = document.createElement('h2');
  heading.className = 'modal-title fs-5';
  heading.textContent = title;
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'btn-close';
  close.setAttribute('data-bs-dismiss', 'modal');
  close.setAttribute('aria-label', 'Close');
  header.append(heading, close);

  const body = document.createElement('div');
  body.className = 'modal-body';
  fields.forEach(field => {
    const group = document.createElement('div');
    group.className = 'mb-3';
    const label = document.createElement('label');
    label.className = 'form-label';
    label.textContent = field.label;
    const input = field.options ? document.createElement('select') : document.createElement('input');
    input.className = field.options ? 'form-select' : 'form-control';
    input.name = field.name;
    input.required = Boolean(field.required);
    if (field.type) input.type = field.type;
    if (field.min !== undefined) input.min = String(field.min);
    if (field.options) {
      field.options.forEach(optionValue => {
        const option = document.createElement('option');
        option.value = optionValue;
        option.textContent = optionValue;
        input.append(option);
      });
    }
    input.value = values[field.name] ?? '';
    label.htmlFor = `action-${field.name}`;
    input.id = label.htmlFor;
    group.append(label, input);
    body.append(group);
  });

  const footer = document.createElement('div');
  footer.className = 'modal-footer';
  const cancel = document.createElement('button');
  cancel.type = 'button';
  cancel.className = 'btn btn-light';
  cancel.setAttribute('data-bs-dismiss', 'modal');
  cancel.textContent = 'Cancel';
  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'btn btn-primary';
  submit.textContent = 'Save';
  footer.append(cancel, submit);
  form.append(header, body, footer);
  content.append(form);
  dialog.append(content);
  wrapper.append(dialog);
  document.body.append(wrapper);

  const modal = new Modal(wrapper);
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    onSubmit(Object.fromEntries(new FormData(form)));
    modal.hide();
  });
  wrapper.addEventListener('hidden.bs.modal', () => wrapper.remove(), { once: true });
  modal.show();
}

function editCategory(id) {
  const categories = readData(storageKeys.categories, initialData.categories);
  const current = categories.find(item => item.id === id);
  if (!current) return;
  createModal('Edit Category', [
    { name: 'name', label: 'Category name', required: true },
    { name: 'description', label: 'Description', required: true },
    { name: 'status', label: 'Status', options: ['Active', 'Inactive'] },
  ], current, values => {
    current.name = values.name.trim();
    current.description = values.description.trim();
    current.status = values.status;
    saveData(storageKeys.categories, categories);
    renderCategories();
    showMessage('Category updated.');
  });
}

function addCategory() {
  createModal('Add Category', [
    { name: 'name', label: 'Category name', required: true },
    { name: 'description', label: 'Description', required: true },
  ], {}, values => {
    const categories = readData(storageKeys.categories, initialData.categories);
    categories.push({ id: crypto.randomUUID(), name: values.name.trim(), description: values.description.trim(), products: 0, status: 'Active' });
    saveData(storageKeys.categories, categories);
    renderCategories();
    showMessage('Category added.');
  });
}

function editSupplier(id) {
  const suppliers = readData(storageKeys.suppliers, initialData.suppliers);
  const current = suppliers.find(item => item.id === id);
  if (!current) return;
  createModal('Edit Supplier', [
    { name: 'name', label: 'Supplier name', required: true },
    { name: 'contact', label: 'Phone number', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'status', label: 'Status', options: ['Active', 'Inactive'] },
  ], current, values => {
    Object.assign(current, { name: values.name.trim(), contact: values.contact.trim(), email: values.email.trim(), status: values.status });
    saveData(storageKeys.suppliers, suppliers);
    renderSuppliers();
    showMessage('Supplier updated.');
  });
}

function addSupplier() {
  createModal('Add Supplier', [
    { name: 'name', label: 'Supplier name', required: true },
    { name: 'contact', label: 'Phone number', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
  ], {}, values => {
    const suppliers = readData(storageKeys.suppliers, initialData.suppliers);
    suppliers.push({ id: crypto.randomUUID(), name: values.name.trim(), contact: values.contact.trim(), email: values.email.trim(), products: 0, status: 'Active' });
    saveData(storageKeys.suppliers, suppliers);
    renderSuppliers();
    showMessage('Supplier added.');
  });
}

function recordMovement() {
  createModal('Record Stock Movement', [
    { name: 'product', label: 'Product', required: true },
    { name: 'type', label: 'Movement type', options: ['Stock In', 'Stock Out'] },
    { name: 'quantity', label: 'Quantity', type: 'number', min: 1, required: true },
    { name: 'reference', label: 'Reference', required: true },
    { name: 'notes', label: 'Notes' },
  ], { product: 'Gaming Joy Stick', type: 'Stock In' }, values => {
    const movements = readData(storageKeys.movements, initialData.movements);
    movements.unshift({
      id: crypto.randomUUID(),
      date: new Date().toLocaleDateString('en-CA'),
      product: values.product.trim(),
      type: values.type,
      quantity: Number(values.quantity),
      reference: values.reference.trim(),
      notes: values.notes.trim(),
    });
    saveData(storageKeys.movements, movements);
    renderMovements();
    showMessage('Stock movement recorded.');
  });
}

function removeItem(kind, id) {
  const isCategory = kind === 'category';
  const key = isCategory ? storageKeys.categories : storageKeys.suppliers;
  const fallback = isCategory ? initialData.categories : initialData.suppliers;
  const items = readData(key, fallback);
  const selected = items.find(item => item.id === id);
  if (!selected || !window.confirm(`Delete ${selected.name}?`)) return;
  saveData(key, items.filter(item => item.id !== id));
  if (isCategory) renderCategories();
  else renderSuppliers();
  showMessage(`${isCategory ? 'Category' : 'Supplier'} deleted.`);
}

function bindSettings() {
  const form = document.querySelector('#settingsForm');
  if (!form) return;

  try {
    const saved = readData(storageKeys.settings, {});
    ['storeName', 'currency', 'lowStock'].forEach(name => {
      if (saved[name] !== undefined) form.elements.namedItem(name).value = saved[name];
    });
  } catch (error) {
    showMessage(error.message, true);
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const values = Object.fromEntries(new FormData(form));
    values.lowStock = Number(values.lowStock);
    try {
      saveData(storageKeys.settings, values);
      showMessage('Settings saved.');
    } catch (error) {
      showMessage(`Settings could not be saved: ${error.message}`, true);
    }
  });
}

function bindProfileActions() {
  const profileLink = [...document.querySelectorAll('.topbar .dropdown-item')]
    .find(link => link.textContent.trim().toLowerCase() === 'profile');
  const profileMenu = document.querySelector('.topbar [aria-label="Profile menu"]');
  const profile = readData(storageKeys.profile, { name: 'Shrina Tesla', username: '@imshrina', email: 'shrina@example.com' });

  document.querySelectorAll('.topbar .dropdown-menu .small').forEach(element => {
    if (element.textContent.trim() === 'Shrina Tesla') element.textContent = profile.name;
    if (element.textContent.trim() === '@imshrina') element.textContent = profile.username;
  });
  if (!profileLink && !profileMenu) return;

  profileLink?.addEventListener('click', event => {
    event.preventDefault();
    const saved = readData(storageKeys.profile, profile);
    createModal('Edit Profile', [
      { name: 'name', label: 'Full name', required: true },
      { name: 'username', label: 'Username', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
    ], saved, values => {
      const nextProfile = { name: values.name.trim(), username: values.username.trim(), email: values.email.trim() };
      saveData(storageKeys.profile, nextProfile);
      document.querySelectorAll('.topbar .dropdown-menu .small').forEach(element => {
        if (element.textContent.trim() === saved.name) element.textContent = nextProfile.name;
        if (element.textContent.trim() === saved.username) element.textContent = nextProfile.username;
      });
      showMessage('Profile updated.');
    });
  });
}

function bindNotifications() {
  const readAll = [...document.querySelectorAll('.topbar a')]
    .find(link => link.textContent.trim().toLowerCase() === 'view all notifications');
  const badge = document.querySelector('.topbar .badge .visually-hidden')?.parentElement;
  if (!readAll || !badge) return;

  const updateUnreadCount = () => {
    const isRead = localStorage.getItem(storageKeys.notificationsRead) === 'true';
    badge.classList.toggle('d-none', isRead);
    if (isRead) readAll.textContent = 'All notifications read';
  };
  updateUnreadCount();

  readAll.addEventListener('click', event => {
    event.preventDefault();
    localStorage.setItem(storageKeys.notificationsRead, 'true');
    updateUnreadCount();
    showMessage('All notifications marked as read.');
  });
}

function bindDataActions() {
  document.querySelector('[data-add-category]')?.addEventListener('click', addCategory);
  document.querySelector('[data-add-supplier]')?.addEventListener('click', addSupplier);
  document.querySelector('[data-add-movement]')?.addEventListener('click', recordMovement);

  document.addEventListener('click', event => {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const { action, id } = button.dataset;
    if (action === 'edit-category') editCategory(id);
    if (action === 'edit-supplier') editSupplier(id);
    if (action === 'delete-category') removeItem('category', id);
    if (action === 'delete-supplier') removeItem('supplier', id);
  });

  try {
    renderCategories();
    renderSuppliers();
    renderMovements();
  } catch (error) {
    showMessage(error.message, true);
  }
}

bindDataActions();
bindSettings();
bindProfileActions();
bindNotifications();
