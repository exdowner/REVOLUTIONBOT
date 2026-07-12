import pyautogui
import keyboard
import time
import threading
import tkinter as tk
from tkinter import ttk
import pyperclip
import random
import json
import os

class BotPaste:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("Bot Ctrl+V + Enter - Multi Mensagens")
        self.root.geometry("600x550")
        self.root.resizable(False, False)
        
        # Variáveis
        self.ativo = False
        self.intervalo = tk.DoubleVar(value=1.0)
        self.coordenadas = {"x": 0, "y": 0}
        self.mensagens = []
        self.mensagem_atual_index = 0
        self.usar_alternancia = tk.BooleanVar(value=True)
        self.arquivo_mensagens = "mensagens.json"
        
        self.setup_ui()
        self.carregar_coordenadas()
        self.carregar_mensagens()
        
    def setup_ui(self):
        # Frame principal com scroll
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # ===== SEÇÃO DE MENSAGENS =====
        ttk.Label(main_frame, text="📝 MENSAGENS (clique duas vezes para editar):", font=("Arial", 10, "bold")).grid(row=0, column=0, columnspan=3, sticky=tk.W, pady=5)
        
        # Frame para lista de mensagens com scroll
        frame_lista = ttk.Frame(main_frame)
        frame_lista.grid(row=1, column=0, columnspan=3, pady=5, sticky=(tk.W, tk.E))
        
        # Listbox com scroll
        scrollbar = ttk.Scrollbar(frame_lista)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        self.lista_mensagens = tk.Listbox(frame_lista, height=6, width=60, yscrollcommand=scrollbar.set, 
                                         selectmode=tk.SINGLE, font=("Arial", 9))
        self.lista_mensagens.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.config(command=self.lista_mensagens.yview)
        
        # Bind duplo clique para editar
        self.lista_mensagens.bind('<Double-Button-1>', self.editar_mensagem)
        
        # Botões de gerenciamento de mensagens
        frame_botoes_msg = ttk.Frame(main_frame)
        frame_botoes_msg.grid(row=2, column=0, columnspan=3, pady=5)
        
        ttk.Button(frame_botoes_msg, text="➕ Adicionar", command=self.adicionar_mensagem, width=12).pack(side=tk.LEFT, padx=2)
        ttk.Button(frame_botoes_msg, text="✏️ Editar", command=self.editar_mensagem_selecionada, width=12).pack(side=tk.LEFT, padx=2)
        ttk.Button(frame_botoes_msg, text="🗑️ Remover", command=self.remover_mensagem, width=12).pack(side=tk.LEFT, padx=2)
        ttk.Button(frame_botoes_msg, text="⬆️ Subir", command=lambda: self.mover_mensagem(-1), width=12).pack(side=tk.LEFT, padx=2)
        ttk.Button(frame_botoes_msg, text="⬇️ Descer", command=lambda: self.mover_mensagem(1), width=12).pack(side=tk.LEFT, padx=2)
        
        # ===== CONFIGURAÇÕES =====
        # Frame de configurações
        frame_config = ttk.LabelFrame(main_frame, text="⚙️ Configurações", padding="10")
        frame_config.grid(row=3, column=0, columnspan=3, pady=10, sticky=(tk.W, tk.E))
        
        # Alternância
        ttk.Checkbutton(frame_config, text="🔄 Alternar mensagens automaticamente", 
                       variable=self.usar_alternancia).grid(row=0, column=0, columnspan=2, sticky=tk.W, pady=5)
        
        # Intervalo
        ttk.Label(frame_config, text="Intervalo (segundos):").grid(row=1, column=0, sticky=tk.W, pady=5)
        scale = ttk.Scale(frame_config, from_=0.1, to=10.0, orient=tk.HORIZONTAL, 
                         variable=self.intervalo, length=200)
        scale.grid(row=1, column=1, sticky=tk.W, padx=(10, 0))
        lbl_intervalo = ttk.Label(frame_config, textvariable=self.intervalo, width=10)
        lbl_intervalo.grid(row=1, column=2, padx=5)
        
        # ===== POSIÇÃO DO CLIQUE =====
        ttk.Label(main_frame, text="📍 Posição do clique:", font=("Arial", 10, "bold")).grid(row=4, column=0, columnspan=3, sticky=tk.W, pady=5)
        
        frame_posicao = ttk.Frame(main_frame)
        frame_posicao.grid(row=5, column=0, columnspan=3, pady=5)
        
        btn_capturar = ttk.Button(frame_posicao, text="🎯 Capturar posição (5s)", 
                                 command=self.capturar_posicao)
        btn_capturar.pack(side=tk.LEFT, padx=5)
        
        self.lbl_posicao = ttk.Label(frame_posicao, text="Posição: não definida")
        self.lbl_posicao.pack(side=tk.LEFT, padx=10)
        
        # ===== CONTROLES PRINCIPAIS =====
        frame_controles = ttk.Frame(main_frame)
        frame_controles.grid(row=6, column=0, columnspan=3, pady=15)
        
        self.btn_iniciar = ttk.Button(frame_controles, text="▶ INICIAR (F8)", 
                                     command=self.iniciar, width=15)
        self.btn_iniciar.pack(side=tk.LEFT, padx=5)
        
        self.btn_parar = ttk.Button(frame_controles, text="⏹ PARAR (F9)", 
                                   command=self.parar, width=15, state=tk.DISABLED)
        self.btn_parar.pack(side=tk.LEFT, padx=5)
        
        # ===== STATUS =====
        frame_status = ttk.Frame(main_frame)
        frame_status.grid(row=7, column=0, columnspan=3, pady=5)
        
        self.lbl_status = ttk.Label(frame_status, text="Status: PARADO", foreground="red", font=("Arial", 10, "bold"))
        self.lbl_status.pack(side=tk.LEFT, padx=10)
        
        self.lbl_mensagem_atual = ttk.Label(frame_status, text="", foreground="blue", font=("Arial", 9))
        self.lbl_mensagem_atual.pack(side=tk.LEFT, padx=10)
        
        # ===== ATALHOS =====
        ttk.Label(main_frame, text="Atalhos: F8=Iniciar, F9=Parar", font=("Arial", 8)).grid(row=8, column=0, columnspan=3, pady=5)
        
        # Configurar atalhos
        keyboard.add_hotkey('f8', self.iniciar)
        keyboard.add_hotkey('f9', self.parar)
        
        # Aviso de fechamento
        self.root.protocol("WM_DELETE_WINDOW", self.fechar)
    
    def adicionar_mensagem(self):
        """Adiciona uma nova mensagem"""
        dialog = tk.Toplevel(self.root)
        dialog.title("Adicionar Mensagem")
        dialog.geometry("400x150")
        dialog.resizable(False, False)
        
        ttk.Label(dialog, text="Digite a nova mensagem:").pack(pady=10)
        entry = ttk.Entry(dialog, width=50)
        entry.pack(pady=5)
        entry.focus()
        
        def salvar():
            msg = entry.get().strip()
            if msg:
                self.mensagens.append(msg)
                self.atualizar_lista()
                self.salvar_mensagens()
                dialog.destroy()
            else:
                ttk.Label(dialog, text="⚠️ Mensagem não pode estar vazia!", foreground="red").pack()
        
        ttk.Button(dialog, text="Salvar", command=salvar).pack(pady=10)
        dialog.bind('<Return>', lambda e: salvar())
    
    def editar_mensagem(self, event=None):
        """Edita a mensagem selecionada via duplo clique"""
        self.editar_mensagem_selecionada()
    
    def editar_mensagem_selecionada(self):
        """Edita a mensagem selecionada"""
        selecao = self.lista_mensagens.curselection()
        if not selecao:
            return
        
        idx = selecao[0]
        msg_atual = self.mensagens[idx]
        
        dialog = tk.Toplevel(self.root)
        dialog.title("Editar Mensagem")
        dialog.geometry("400x150")
        dialog.resizable(False, False)
        
        ttk.Label(dialog, text="Edite a mensagem:").pack(pady=10)
        entry = ttk.Entry(dialog, width=50)
        entry.insert(0, msg_atual)
        entry.pack(pady=5)
        entry.focus()
        entry.select_range(0, tk.END)
        
        def salvar():
            nova_msg = entry.get().strip()
            if nova_msg:
                self.mensagens[idx] = nova_msg
                self.atualizar_lista()
                self.salvar_mensagens()
                dialog.destroy()
            else:
                ttk.Label(dialog, text="⚠️ Mensagem não pode estar vazia!", foreground="red").pack()
        
        ttk.Button(dialog, text="Salvar", command=salvar).pack(pady=10)
        dialog.bind('<Return>', lambda e: salvar())
    
    def remover_mensagem(self):
        """Remove a mensagem selecionada"""
        selecao = self.lista_mensagens.curselection()
        if not selecao:
            return
        
        idx = selecao[0]
        del self.mensagens[idx]
        self.atualizar_lista()
        self.salvar_mensagens()
    
    def mover_mensagem(self, direcao):
        """Move a mensagem para cima (-1) ou baixo (1)"""
        selecao = self.lista_mensagens.curselection()
        if not selecao:
            return
        
        idx = selecao[0]
        novo_idx = idx + direcao
        
        if 0 <= novo_idx < len(self.mensagens):
            self.mensagens[idx], self.mensagens[novo_idx] = self.mensagens[novo_idx], self.mensagens[idx]
            self.atualizar_lista()
            self.lista_mensagens.selection_set(novo_idx)
            self.salvar_mensagens()
    
    def atualizar_lista(self):
        """Atualiza a lista de mensagens na interface"""
        self.lista_mensagens.delete(0, tk.END)
        for i, msg in enumerate(self.mensagens):
            # Mostrar apenas os primeiros 50 caracteres
            display = msg[:50] + "..." if len(msg) > 50 else msg
            self.lista_mensagens.insert(tk.END, f"{i+1}. {display}")
    
    def salvar_mensagens(self):
        """Salva as mensagens em um arquivo JSON"""
        try:
            with open(self.arquivo_mensagens, "w", encoding="utf-8") as f:
                json.dump(self.mensagens, f, ensure_ascii=False, indent=2)
        except:
            pass
    
    def carregar_mensagens(self):
        """Carrega as mensagens do arquivo JSON"""
        try:
            if os.path.exists(self.arquivo_mensagens):
                with open(self.arquivo_mensagens, "r", encoding="utf-8") as f:
                    self.mensagens = json.load(f)
                    if not self.mensagens:
                        self.mensagens = ["Mensagem padrão 1", "Mensagem padrão 2", "Mensagem padrão 3"]
            else:
                self.mensagens = ["Mensagem padrão 1", "Mensagem padrão 2", "Mensagem padrão 3"]
            
            self.atualizar_lista()
        except:
            self.mensagens = ["Mensagem padrão 1", "Mensagem padrão 2", "Mensagem padrão 3"]
            self.atualizar_lista()
    
    def capturar_posicao(self):
        """Captura a posição do mouse após 5 segundos"""
        def capturar():
            for i in range(5, 0, -1):
                self.lbl_posicao.config(text=f"Capturando em {i}...")
                time.sleep(1)
            
            x, y = pyautogui.position()
            self.coordenadas["x"] = x
            self.coordenadas["y"] = y
            self.lbl_posicao.config(text=f"Posição: ({x}, {y})")
            
            # Salvar coordenadas
            with open("coordenadas.txt", "w") as f:
                f.write(f"{x},{y}")
        
        threading.Thread(target=capturar, daemon=True).start()
    
    def carregar_coordenadas(self):
        """Carrega coordenadas salvas anteriormente"""
        try:
            with open("coordenadas.txt", "r") as f:
                x, y = map(int, f.read().split(","))
                self.coordenadas["x"] = x
                self.coordenadas["y"] = y
                self.lbl_posicao.config(text=f"Posição: ({x}, {y})")
        except:
            pass
    
    def get_proxima_mensagem(self):
        """Retorna a próxima mensagem na fila"""
        if not self.mensagens:
            return "Mensagem padrão"
        
        if self.usar_alternancia.get():
            msg = self.mensagens[self.mensagem_atual_index]
            self.mensagem_atual_index = (self.mensagem_atual_index + 1) % len(self.mensagens)
            return msg
        else:
            return self.mensagens[0]  # Sempre usa a primeira se alternância estiver desligada
    
    def executar(self):
        """Loop principal do bot"""
        while self.ativo:
            try:
                # Pegar próxima mensagem
                mensagem = self.get_proxima_mensagem()
                
                # Atualizar label com mensagem atual
                self.root.after(0, lambda: self.lbl_mensagem_atual.config(
                    text=f"📨 Enviando: {mensagem[:30]}{'...' if len(mensagem) > 30 else ''}"))
                
                # Copiar conteúdo para área de transferência
                pyperclip.copy(mensagem)
                
                # Clicar na posição definida
                pyautogui.click(self.coordenadas["x"], self.coordenadas["y"])
                time.sleep(0.2)
                
                # Ctrl+V para colar
                pyautogui.hotkey('ctrl', 'v')
                time.sleep(0.1)
                
                # Enter para enviar
                pyautogui.press('enter')
                
                # Aguardar o intervalo definido
                time.sleep(self.intervalo.get())
                
            except Exception as e:
                print(f"Erro: {e}")
                self.root.after(0, lambda: self.lbl_status.config(
                    text=f"❌ Erro: {e}", foreground="red"))
                self.parar()
                break
    
    def iniciar(self):
        """Inicia o bot"""
        if not self.ativo:
            # Verificar se há mensagens
            if not self.mensagens:
                self.lbl_status.config(text="⚠ Adicione pelo menos uma mensagem!", foreground="orange")
                return
            
            # Verificar se a posição foi definida
            if self.coordenadas["x"] == 0 and self.coordenadas["y"] == 0:
                self.lbl_status.config(text="⚠ Defina a posição do clique primeiro!", foreground="orange")
                return
            
            self.ativo = True
            self.mensagem_atual_index = 0
            self.btn_iniciar.config(state=tk.DISABLED)
            self.btn_parar.config(state=tk.NORMAL)
            self.lbl_status.config(text="Status: ATIVO", foreground="green")
            
            # Iniciar thread de execução
            threading.Thread(target=self.executar, daemon=True).start()
    
    def parar(self):
        """Para o bot"""
        self.ativo = False
        self.btn_iniciar.config(state=tk.NORMAL)
        self.btn_parar.config(state=tk.DISABLED)
        self.lbl_status.config(text="Status: PARADO", foreground="red")
        self.lbl_mensagem_atual.config(text="")
    
    def fechar(self):
        """Fecha o programa"""
        self.parar()
        self.salvar_mensagens()
        self.root.destroy()

def main():
    # Instalar dependências se necessário
    try:
        import pyautogui
        import keyboard
        import pyperclip
    except ImportError:
        print("Instalando dependências...")
        import subprocess
        import sys
        subprocess.check_call([sys.executable, "-m", "pip", "install", "pyautogui", "keyboard", "pyperclip"])
        print("Dependências instaladas! Reinicie o programa.")
        input("Pressione Enter para sair...")
        return
    
    app = BotPaste()
    app.root.mainloop()

if __name__ == "__main__":
    main()