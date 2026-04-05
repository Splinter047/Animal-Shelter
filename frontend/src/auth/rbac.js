export function navItemsForRole(role) {
  const items = [
    { to: '/', label: 'Dashboard' },
    { to: '/animals', label: 'Animals' },
  ];

  if (['Manager', 'Admin'].includes(role)) {
    items.push({ to: '/adoptions', label: 'Adoptions' });
  }

  if (['Manager', 'Rescuer', 'Admin'].includes(role)) {
    items.push({ to: '/rescues', label: 'Rescues' });
  }

  if (role === 'Manager') {
    items.push({ to: '/employees', label: 'Staff' });
    items.push({ to: '/audit-logs', label: 'Audit Logs' });
  }

  if (['Manager', 'Admin'].includes(role)) {
    items.push({ to: '/surrender', label: 'Surrender' });
  }

  items.push({ to: '/analytics', label: 'Analytics' });
  return items;
}

export function canCreateAnimal(role) {
  return ['Manager', 'Veterinarian'].includes(role);
}

export function canEditAnimal(role) {
  return ['Manager', 'Veterinarian'].includes(role);
}

export function canDeleteAnimal(role) {
  return role === 'Manager';
}

export function canManageAdoptions(role) {
  return ['Manager', 'Admin'].includes(role);
}

export function canViewRescueReports(role) {
  return ['Manager', 'Rescuer', 'Admin'].includes(role);
}

export function canManageMissions(role) {
  return ['Manager', 'Rescuer'].includes(role);
}

export function canManageEmployees(role) {
  return role === 'Manager';
}

export function canSurrenderIntake(role) {
  return ['Manager', 'Admin'].includes(role);
}

export function canCreateCareLog(role) {
  return ['Veterinarian', 'Caretaker', 'Manager'].includes(role);
}

export function canEditCareLog(role) {
  return ['Veterinarian', 'Manager'].includes(role);
}
