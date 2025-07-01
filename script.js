// Estado global de la aplicación (idéntico a Laravel)
let appState = {
    step: 1,
    numPersonas: 0,
    personas: [], // Array de objetos { nombre: string, monto: number, etiqueta: string, noPago: boolean }
};

// Elementos del DOM
const elements = {
    header: null,
    formContainer: null,
    resultadosContainer: null,
    errorContainer: null,
    modal: null,
    modalText: null
};

// Inicializar la aplicación cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    initializeEventListeners();
    showStep1();
});

// Inicializar referencias a elementos del DOM
function initializeElements() {
    elements.header = document.getElementById('mainHeader');
    elements.formContainer = document.getElementById('mainCard');
    elements.resultadosContainer = document.getElementById('resultadosCard');
    elements.errorContainer = document.getElementById('errorContainer');
    elements.modal = document.getElementById('whatsappModal');
    elements.modalText = document.getElementById('textoWhatsApp');
}

// Inicializar event listeners
function initializeEventListeners() {
    // Event listener para cerrar modal
    document.querySelector('.close-modal').addEventListener('click', closeModal);
    
    // Cerrar modal al hacer click fuera de él
    elements.modal.addEventListener('click', function(e) {
        if (e.target === elements.modal) {
            closeModal();
        }
    });
    
    // Event listener para escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && elements.modal.style.display === 'block') {
            closeModal();
        }
    });
}

// Función para mostrar errores
function showError(message) {
    elements.errorContainer.innerHTML = message;
    elements.errorContainer.style.display = 'block';
    elements.errorContainer.scrollIntoView({ behavior: 'smooth' });
}

// Función para limpiar errores
function clearError() {
    elements.errorContainer.innerHTML = '';
    elements.errorContainer.style.display = 'none';
}

// Función para actualizar el header
function updateHeader(isResults = false, title = 'División de Cuentas', subtitle = 'Para yopes que no saben cómo dividir gastos') {
    const headerClass = isResults ? 'ios-header resultado-header fade-in' : 'ios-header fade-in';
    elements.header.className = headerClass;
    
    document.getElementById('headerTitle').textContent = title;
    document.getElementById('headerSubtitle').textContent = subtitle;
}

// Paso 1: Número de personas
function showStep1() {
    appState.step = 1;
    clearError();
    updateHeader();
    
    // Mostrar la sección inicial y ocultar las demás
    document.getElementById('seccionInicial').style.display = 'block';
    document.getElementById('seccionNombres').style.display = 'none';
    document.getElementById('seccionMontos').style.display = 'none';
    document.getElementById('resultadosCard').style.display = 'none';
    document.getElementById('mainCard').style.display = 'block';
    
    // Limpiar el selector
    document.getElementById('numeroPersonas').value = '';
}

// Manejar el paso 1
function handleStep1() {
    const numPersonas = parseInt(document.getElementById('numeroPersonas').value);
    
    if (!numPersonas || numPersonas < 2 || numPersonas > 15) {
        showError('Por favor selecciona un número válido de personas (entre 2 y 15)');
        return;
    }
    
    appState.numPersonas = numPersonas;
    appState.personas = Array.from({length: numPersonas}, () => ({ 
        nombre: '', 
        monto: 0, 
        etiqueta: '', 
        noPago: false 
    }));
    showStep2();
}

// Paso 2: Nombres de las personas
function showStep2() {
    appState.step = 2;
    clearError();
    
    // Mostrar/ocultar secciones
    document.getElementById('seccionInicial').style.display = 'none';
    document.getElementById('seccionNombres').style.display = 'block';
    document.getElementById('seccionMontos').style.display = 'none';
    
    // Generar campos de nombres
    const container = document.getElementById('camposNombres');
    container.innerHTML = '';
    
    for (let i = 0; i < appState.numPersonas; i++) {
        const div = document.createElement('div');
        div.className = 'ios-form-group';
        div.innerHTML = `
            <label for="nombre_${i}" class="ios-label">Participante ${i + 1}</label>
            <input type="text" 
                   id="nombre_${i}" 
                   class="ios-input" 
                   placeholder="Nombre de la persona ${i + 1}"
                   value="${appState.personas[i].nombre}"
                   maxlength="50">
        `;
        container.appendChild(div);
    }
}

// Manejar el paso 2
function handleStep2() {
    const nombres = [];
    let hasError = false;
    
    for (let i = 0; i < appState.numPersonas; i++) {
        const nombre = document.getElementById(`nombre_${i}`).value.trim();
        if (!nombre) {
            showError(`Por favor ingresa el nombre de la persona ${i + 1}`);
            hasError = true;
            break;
        }
        nombres.push(nombre);
    }
    
    if (hasError) return;
    
    // Verificar nombres duplicados
    const nombresUnicos = new Set(nombres.map(n => n.toLowerCase()));
    if (nombresUnicos.size !== nombres.length) {
        showError('No puede haber nombres duplicados');
        return;
    }
    
    // Guardar nombres
    for (let i = 0; i < appState.numPersonas; i++) {
        appState.personas[i].nombre = nombres[i];
    }
    
    showStep3();
}

// Paso 3: Montos de cada persona (exactamente como en Laravel)
function showStep3() {
    appState.step = 3;
    clearError();
    
    // Mostrar/ocultar secciones
    document.getElementById('seccionInicial').style.display = 'none';
    document.getElementById('seccionNombres').style.display = 'none';
    document.getElementById('seccionMontos').style.display = 'block';
    
    // Generar campos de montos (idéntico a Laravel)
    const container = document.getElementById('personasContainer');
    container.innerHTML = '';
    
    for (let i = 0; i < appState.numPersonas; i++) {
        const personaDiv = document.createElement('div');
        personaDiv.className = 'persona-card slide-in';
        personaDiv.style.animationDelay = `${i * 0.1}s`;
        
        personaDiv.innerHTML = `
            <h4 class="ios-headline mb-3" style="text-align: center; color: var(--text-secondary); font-weight: 700;">
                👤 ${appState.personas[i].nombre}
            </h4>
            
            <!-- Checkbox principal para "No realizó pagos" -->
            <div class="ios-checkbox mb-3" style="border: 1px solid var(--error); background: rgba(239, 68, 68, 0.1);" onclick="toggleNoPago(${i})">
                <input type="checkbox" id="noPago${i}" ${appState.personas[i].noPago ? 'checked' : ''}>
                <label class="ios-checkbox-label" for="noPago${i}" style="font-size: 14px; font-weight: 600; color: var(--error);">
                    🚫 No realizó pagos
                </label>
            </div>
            
            <!-- Campos de monto (se deshabilitan si no pagó) -->
            <div id="camposMonto${i}" style="${appState.personas[i].noPago ? 'opacity: 0.5; pointer-events: none;' : ''}">
                <div class="ios-form-group">
                    <label for="monto${i}" class="ios-label">Monto Pagado</label>
                    <div class="ios-input-group">
                        <div class="ios-input-group-text">$</div>
                        <input type="number" 
                               step="0.01" 
                               min="0" 
                               class="ios-input" 
                               id="monto${i}" 
                               placeholder="0.00" 
                               value="${appState.personas[i].monto || ''}"
                               oninput="validarMonto(${i})" 
                               ${appState.personas[i].noPago ? 'disabled' : ''}>
                    </div>
                    <div class="ios-helper-text">Ingresa el monto que pagó esta persona (obligatorio si no marca "No realizó pagos")</div>
                    <div id="errorMonto${i}" class="ios-helper-text" style="color: var(--error); display: none; font-weight: 600;">
                        ⚠️ El monto no puede ser negativo
                    </div>
                </div>
                
                <!-- Checkbox para mostrar campo de etiqueta -->
                <div class="ios-checkbox" onclick="toggleEtiqueta(${i})">
                    <input type="checkbox" id="masEtiqueta${i}" ${appState.personas[i].etiqueta ? 'checked' : ''}>
                    <label class="ios-checkbox-label" for="masEtiqueta${i}" style="font-size: 13px; color: var(--text-muted);">
                        📝 Agregar descripción
                    </label>
                </div>
                
                <!-- Campo de etiqueta (inicialmente oculto) -->
                <div id="etiquetaGroup${i}" style="display: ${appState.personas[i].etiqueta ? 'block' : 'none'};" class="ios-form-group">
                    <label for="etiqueta${i}" class="ios-label">Descripción del Gasto</label>
                    <input type="text" 
                           class="ios-input" 
                           id="etiqueta${i}" 
                           placeholder="Ej: Cena, gasolina, etc."
                           value="${appState.personas[i].etiqueta || ''}">
                </div>
            </div>
        `;
        
        container.appendChild(personaDiv);
    }
}

// Función para alternar checkbox "No realizó pagos" (idéntica a Laravel)
function toggleNoPago(index) {
    const checkbox = document.getElementById(`noPago${index}`);
    const camposMonto = document.getElementById(`camposMonto${index}`);
    const montoInput = document.getElementById(`monto${index}`);
    
    if (checkbox.checked) {
        // Deshabilitar campos de monto
        camposMonto.style.opacity = '0.5';
        camposMonto.style.pointerEvents = 'none';
        montoInput.value = '0';  // Establecer explícitamente en 0
        montoInput.disabled = true;
        
        // Actualizar estado
        appState.personas[index].noPago = true;
        appState.personas[index].monto = 0;
        
        // Ocultar etiqueta si estaba visible
        const etiquetaGroup = document.getElementById(`etiquetaGroup${index}`);
        const etiquetaCheckbox = document.getElementById(`masEtiqueta${index}`);
        etiquetaGroup.style.display = 'none';
        etiquetaCheckbox.checked = false;
        
        // Limpiar campo de etiqueta
        const etiquetaInput = document.getElementById(`etiqueta${index}`);
        if (etiquetaInput) {
            etiquetaInput.value = '';
            appState.personas[index].etiqueta = '';
        }
    } else {
        // Habilitar campos de monto
        camposMonto.style.opacity = '1';
        camposMonto.style.pointerEvents = 'auto';
        montoInput.disabled = false;
        montoInput.value = '';  // Limpiar para que el usuario ingrese el monto
        
        // Actualizar estado
        appState.personas[index].noPago = false;
        appState.personas[index].monto = 0;
    }
}

// Función para alternar campo de etiqueta (idéntica a Laravel)
function toggleEtiqueta(index) {
    const checkbox = document.getElementById(`masEtiqueta${index}`);
    const etiquetaGroup = document.getElementById(`etiquetaGroup${index}`);
    
    if (checkbox.checked) {
        etiquetaGroup.style.display = 'block';
        etiquetaGroup.style.animation = 'fadeIn 0.3s ease';
    } else {
        etiquetaGroup.style.display = 'none';
        // Limpiar campo cuando se colapsa
        const etiquetaInput = document.getElementById(`etiqueta${index}`);
        if (etiquetaInput) {
            etiquetaInput.value = '';
            appState.personas[index].etiqueta = '';
        }
    }
}

// Función para validar montos (idéntica a Laravel)
function validarMonto(index) {
    const montoInput = document.getElementById(`monto${index}`);
    const errorDiv = document.getElementById(`errorMonto${index}`);
    const inputValue = montoInput.value;
    
    // Limpiar estilos de error primero
    errorDiv.style.display = 'none';
    montoInput.style.borderColor = '';
    montoInput.style.boxShadow = '';
    
    // Si el campo está vacío, no mostrar error (se manejará en el envío)
    if (inputValue === '' || inputValue === null) {
        appState.personas[index].monto = 0;
        return;
    }
    
    const valor = parseFloat(inputValue);
    
    // Validar si es un número válido
    if (isNaN(valor)) {
        errorDiv.innerHTML = '⚠️ Por favor ingresa un número válido';
        errorDiv.style.display = 'block';
        montoInput.style.borderColor = 'var(--error)';
        montoInput.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.2)';
        return;
    }
    
    // Validar si es negativo
    if (valor < 0) {
        errorDiv.innerHTML = '⚠️ El monto no puede ser negativo';
        errorDiv.style.display = 'block';
        montoInput.style.borderColor = 'var(--error)';
        montoInput.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.2)';
        // Cambiar el valor a 0 automáticamente
        setTimeout(() => {
            montoInput.value = '0';
            errorDiv.style.display = 'none';
            montoInput.style.borderColor = '';
            montoInput.style.boxShadow = '';
            appState.personas[index].monto = 0;
        }, 1500);
        return;
    }
    
    // Actualizar estado si el valor es válido
    appState.personas[index].monto = valor;
}

// Manejar el paso 3 (calcular división como Laravel)
function handleStep3() {
    clearError();
    
    // Recopilar y validar datos de las personas
    let hasError = false;
    let totalGastado = 0;
    let personasConPagos = 0;
    
    for (let i = 0; i < appState.numPersonas; i++) {
        const noPagoCheckbox = document.getElementById(`noPago${i}`);
        const montoInput = document.getElementById(`monto${i}`);
        const etiquetaInput = document.getElementById(`etiqueta${i}`);
        
        // Actualizar estado con datos actuales
        appState.personas[i].noPago = noPagoCheckbox.checked;
        
        if (!appState.personas[i].noPago) {
            const monto = parseFloat(montoInput.value);
            
            if (isNaN(monto) || monto <= 0) {
                showError(`Por favor ingresa un monto válido para ${appState.personas[i].nombre}`);
                hasError = true;
                break;
            }
            
            appState.personas[i].monto = monto;
            totalGastado += monto;
            personasConPagos++;
        } else {
            appState.personas[i].monto = 0;
        }
        
        // Actualizar etiqueta
        if (etiquetaInput) {
            appState.personas[i].etiqueta = etiquetaInput.value.trim();
        }
    }
    
    if (hasError) return;
    
    // Validar que al menos una persona haya pagado
    if (personasConPagos === 0) {
        showError('Al menos una persona debe haber realizado un pago');
        return;
    }
    
    // Calcular división
    calcularYMostrarResultados();
}

// Calcular división (algoritmo idéntico a Laravel)
function calcularYMostrarResultados() {
    // Calcular totales
    const totalGastado = appState.personas.reduce((sum, persona) => sum + persona.monto, 0);
    const porPersona = totalGastado / appState.numPersonas;
    
    // Calcular balances
    const balances = appState.personas.map(persona => {
        const balance = persona.monto - porPersona;
        return {
            nombre: persona.nombre,
            pago: persona.monto,
            etiqueta: persona.etiqueta,
            debe_pagar: porPersona,
            balance: balance,
            status: balance > 0.01 ? 'creditor' : balance < -0.01 ? 'debtor' : 'balanced'
        };
    });
    
    // Calcular transferencias usando el algoritmo de Laravel
    const liquidaciones = calcularLiquidaciones(balances);
    
    // Mostrar resultados
    mostrarResultados(totalGastado, porPersona, balances, liquidaciones);
}

// Algoritmo de liquidaciones (idéntico a Laravel)
function calcularLiquidaciones(balances) {
    const acreedores = balances.filter(b => b.balance > 0.01)
        .map(b => ({ nombre: b.nombre, monto: b.balance }))
        .sort((a, b) => b.monto - a.monto);
    
    const deudores = balances.filter(b => b.balance < -0.01)
        .map(b => ({ nombre: b.nombre, monto: Math.abs(b.balance) }))
        .sort((a, b) => b.monto - a.monto);
    
    const liquidaciones = [];
    let i = 0, j = 0;
    
    while (i < acreedores.length && j < deudores.length) {
        const acreedor = acreedores[i];
        const deudor = deudores[j];
        const montoTransferencia = Math.min(acreedor.monto, deudor.monto);
        
        liquidaciones.push({
            de: deudor.nombre,
            para: acreedor.nombre,
            monto: montoTransferencia
        });
        
        acreedor.monto -= montoTransferencia;
        deudor.monto -= montoTransferencia;
        
        if (acreedor.monto < 0.01) i++;
        if (deudor.monto < 0.01) j++;
    }
    
    return liquidaciones;
}

// Mostrar resultados (idéntico a Laravel)
function mostrarResultados(totalGastado, porPersona, balances, liquidaciones) {
    updateHeader(true, 'Resultados', 'Aquí están los balances y transferencias necesarias');
    
    // Ocultar formulario y mostrar resultados
    document.getElementById('mainCard').style.display = 'none';
    document.getElementById('resultadosCard').style.display = 'block';
    
    // Llenar resumen general
    document.getElementById('resumenGeneral').innerHTML = `
        <div class="resultado-card">
            <div class="ios-headline">$${totalGastado.toFixed(2)}</div>
            <div class="ios-footnote">Total Gastado</div>
        </div>
        <div class="resultado-card">
            <div class="ios-headline">${appState.numPersonas}</div>
            <div class="ios-footnote">Personas</div>
        </div>
        <div class="resultado-card">
            <div class="ios-headline">$${porPersona.toFixed(2)}</div>
            <div class="ios-footnote">Por Persona</div>
        </div>
    `;
    
    // Llenar sección de transferencias
    if (liquidaciones.length > 0) {
        document.getElementById('transferenciasSection').innerHTML = `
            <h3 class="transfers-title">
                💸 Transferencias Necesarias
            </h3>
            ${liquidaciones.map(liquidacion => `
                <div class="movimiento-card">
                    <strong>${liquidacion.de}</strong> debe transferir 
                    <strong>$${liquidacion.monto.toFixed(2)}</strong> 
                    a <strong>${liquidacion.para}</strong>
                </div>
            `).join('')}
            
            <div class="ios-success text-center mt-3">
                <strong>Completando estas transferencias se balancearán todas las cuentas</strong>
            </div>
        `;
    } else {
        document.getElementById('transferenciasSection').innerHTML = `
            <h3 class="transfers-title">
                ✅ Estado de Cuentas
            </h3>
            <div class="ios-success text-center">
                <strong>¡Todos los participantes están balanceados!</strong><br>
                No se requieren transferencias adicionales
            </div>
        `;
    }
    
    // Llenar resumen de balances
    document.getElementById('balancesContainer').innerHTML = balances.map(balance => `
        <div class="balance-card">
            <div class="balance-info">
                <span class="balance-name">👤 ${balance.nombre}</span>
                <span class="balance-amount">Pagó $${balance.pago.toFixed(2)}</span>
            </div>
            ${balance.status === 'creditor' ? 
                `<span class="balance-status creditor">+$${balance.balance.toFixed(2)}</span>` :
                balance.status === 'debtor' ?
                `<span class="balance-status debtor">-$${Math.abs(balance.balance).toFixed(2)}</span>` :
                `<span class="balance-status balanced">$0.00</span>`
            }
        </div>
    `).join('');
    
    // Llenar detalles expandibles
    document.getElementById('detailsContent').innerHTML = balances.map(balance => `
        <div class="balance-card-expanded">
            <div class="balance-card-header">
                <h4 class="balance-card-title">👤 ${balance.nombre}</h4>
            </div>
            
            <div class="balance-details">
                <div class="balance-item">
                    <span class="balance-label">Monto Pagado</span>
                    <span class="balance-value">$${balance.pago.toFixed(2)}</span>
                </div>
                
                ${balance.etiqueta ? `
                    <div class="balance-item">
                        <span class="balance-label">Concepto</span>
                        <span class="concept-tag">${balance.etiqueta}</span>
                    </div>
                ` : ''}
                
                <div class="balance-item">
                    <span class="balance-label">Debe Pagar</span>
                    <span class="balance-value">$${balance.debe_pagar.toFixed(2)}</span>
                </div>
                
                <div class="balance-item">
                    <span class="balance-label">Estado Final</span>
                    ${balance.status === 'creditor' ?
                        `<span class="balance-status creditor">+$${balance.balance.toFixed(2)} (le deben)</span>` :
                        balance.status === 'debtor' ?
                        `<span class="balance-status debtor">-$${Math.abs(balance.balance).toFixed(2)} (debe)</span>` :
                        `<span class="balance-status balanced">$0.00 (equilibrado)</span>`
                    }
                </div>
            </div>
        </div>
    `).join('');
}

// Toggle detalles
function toggleDetails() {
    const toggle = document.querySelector('.details-toggle');
    const content = document.getElementById('detailsContent');
    const icon = document.querySelector('.details-toggle-icon');
    const text = document.querySelector('.details-toggle-text');
    
    if (content.classList.contains('show')) {
        content.classList.remove('show');
        toggle.classList.remove('expanded');
        text.textContent = '📊 Ver Detalles Completos';
        icon.textContent = '▼';
    } else {
        content.classList.add('show');
        toggle.classList.add('expanded');
        text.textContent = '📊 Ocultar Detalles';
        icon.textContent = '▲';
    }
}

// Nueva calculación
function nuevaCalculacion() {
    appState = {
        step: 1,
        numPersonas: 0,
        personas: []
    };
    
    showStep1();
}

// Compartir por WhatsApp
function shareWhatsApp() {
    const totalGastado = appState.personas.reduce((sum, persona) => sum + persona.monto, 0);
    const porPersona = totalGastado / appState.numPersonas;
    
    // Calcular balances para transferencias
    const balances = appState.personas.map(persona => {
        const balance = persona.monto - porPersona;
        return {
            nombre: persona.nombre,
            pago: persona.monto,
            etiqueta: persona.etiqueta,
            debe_pagar: porPersona,
            balance: balance,
            status: balance > 0.01 ? 'creditor' : balance < -0.01 ? 'debtor' : 'balanced'
        };
    });
    
    const liquidaciones = calcularLiquidaciones(balances);
    
    let mensaje = `*RESUMEN DE GASTOS COMPARTIDOS*\n\n`;
    mensaje += `Total gastado: $${totalGastado.toFixed(2)}\n`;
    mensaje += `Por persona: $${porPersona.toFixed(2)}\n\n`;
    
    if (liquidaciones.length > 0) {
        mensaje += `*TRANSFERENCIAS NECESARIAS:*\n`;
        liquidaciones.forEach(t => {
            mensaje += `• ${t.de} → ${t.para}: $${t.monto.toFixed(2)}\n`;
        });
        mensaje += `\n`;
    } else {
        mensaje += `✅ *¡Todas las cuentas están equilibradas!*\n\n`;
    }
    
    mensaje += `*DETALLE POR PERSONA:*\n`;
    balances.forEach((balance) => {
        mensaje += `• ${balance.nombre}: `;
        mensaje += `Pagó $${balance.pago.toFixed(2)} | `;
        mensaje += `Debe $${balance.debe_pagar.toFixed(2)} | `;
        mensaje += `Balance $${balance.balance.toFixed(2)}\n`;
    });
    
    mensaje += `\n_Calculado con División de Gastos_`;
    
    // Mostrar modal
    elements.modalText.value = mensaje;
    elements.modal.style.display = 'block';
}

// Abrir WhatsApp
function openWhatsApp() {
    shareWhatsApp(); // Primero generar el texto
    const mensaje = elements.modalText.value;
    const mensajeCodificado = encodeURIComponent(mensaje);
    
    // Detectar si es móvil para usar la URL correcta
    const esMobil = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    let url;
    if (esMobil) {
        // Para móviles: usar whatsapp:// que abre la app directamente
        url = `whatsapp://send?text=${mensajeCodificado}`;
    } else {
        // Para escritorio: usar web.whatsapp.com
        url = `https://web.whatsapp.com/send?text=${mensajeCodificado}`;
    }
    
    // Intentar abrir WhatsApp
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.target = '_blank';
    enlace.click();
    
    // Fallback: si no funciona en móvil, mostrar el modal para copiar
    if (esMobil) {
        setTimeout(() => {
            const confirmacion = confirm('¿No se abrió WhatsApp?\n\nPuedes copiar el texto y pegarlo manualmente en WhatsApp.');
            if (confirmacion) {
                // El modal ya está abierto, solo necesitamos enfocarlo
                elements.modalText.focus();
                elements.modalText.select();
            }
        }, 1000);
    }
}

// Copiar texto
function copyText() {
    elements.modalText.select();
    elements.modalText.setSelectionRange(0, 99999);
    
    try {
        document.execCommand('copy');
        
        // Feedback visual
        const button = event.target;
        const originalText = button.textContent;
        button.textContent = '✅ ¡Copiado!';
        button.style.background = 'var(--success)';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '';
        }, 2000);
    } catch (err) {
        console.error('Error al copiar:', err);
        alert('No se pudo copiar el texto. Por favor, selecciona y copia manualmente.');
    }
}

// Cerrar modal
function closeModal() {
    elements.modal.style.display = 'none';
}

// Funciones globales para que puedan ser llamadas desde el HTML
window.handleStep1 = handleStep1;
window.handleStep2 = handleStep2;
window.handleStep3 = handleStep3;
window.showStep1 = showStep1;
window.showStep2 = showStep2;
window.toggleNoPago = toggleNoPago;
window.toggleEtiqueta = toggleEtiqueta;
window.validarMonto = validarMonto;
window.toggleDetails = toggleDetails;
window.nuevaCalculacion = nuevaCalculacion;
window.shareWhatsApp = shareWhatsApp;
window.openWhatsApp = openWhatsApp;
window.copyText = copyText;
window.closeModal = closeModal;
