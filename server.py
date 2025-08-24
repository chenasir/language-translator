#!/usr/bin/env python3
"""
简单的本地HTTP服务器，用于运行多语言翻译助手
避免浏览器的CORS限制
"""

import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8080

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=os.getcwd(), **kwargs)
    
    def end_headers(self):
        # 添加CORS头部以支持API调用
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        super().end_headers()
    
    def do_OPTIONS(self):
        # 处理预检请求
        self.send_response(200)
        self.end_headers()

def main():
    # 检查端口是否可用
    try:
        with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
            print(f"🌐 多语言翻译助手服务器启动成功!")
            print(f"📍 服务地址: http://localhost:{PORT}")
            print(f"🔧 当前目录: {os.getcwd()}")
            print(f"⚡ 按 Ctrl+C 停止服务器")
            print("-" * 50)
            
            # 自动打开浏览器
            try:
                webbrowser.open(f'http://localhost:{PORT}')
                print("🚀 已自动打开浏览器")
            except:
                print("💡 请手动访问上述地址")
            
            print("-" * 50)
            httpd.serve_forever()
            
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"❌ 端口 {PORT} 已被占用，请尝试以下解决方案:")
            print(f"   1. 关闭占用端口的程序")
            print(f"   2. 使用其他端口: python3 server.py --port 8081")
            print(f"   3. 直接打开 index.html 文件")
        else:
            print(f"❌ 启动服务器失败: {e}")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n👋 服务器已停止")
        sys.exit(0)

if __name__ == "__main__":
    # 检查是否指定了自定义端口
    if len(sys.argv) > 1:
        if sys.argv[1] == "--help" or sys.argv[1] == "-h":
            print("用法: python3 server.py [--port PORT]")
            print("默认端口: 8080")
            sys.exit(0)
        elif sys.argv[1] == "--port" and len(sys.argv) > 2:
            try:
                PORT = int(sys.argv[2])
            except ValueError:
                print("❌ 端口号必须是数字")
                sys.exit(1)
    
    main()