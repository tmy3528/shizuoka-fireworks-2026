import codecs
import re

# このプログラムはGitHubサーバー上で自動実行され、ポータルサイト（Walkerplus等）の情報をスクレイピングします。
# ※今回はサンプルとして、花火大会の日程が新しく発表されたと仮定して動作する処理を作っています。
# 実際には requests と BeautifulSoup を使って外部サイトをパースします。
# import requests
# from bs4 import BeautifulSoup

def fetch_latest_schedule():
    print("■ 花火情報サイトから最新のスケジュールを取得・解析中...")
    
    # ここにインターネットから最新の2026年情報を取得するロジックが入ります。
    # 例: res = requests.get('https://example.com/shizuoka-fireworks')
    # 今回は例として「安倍川花火大会」の『正式日時が発表された』と検知したとします。
    return {
        "第73回安倍川花火大会": {
            "dateStr": "2026/07/25",  # 新たに発見した確定日付
            "isEstimated": False      # （未定）マークを外す
        }
    }

def update_data():
    filepath = 'data.js'
    try:
        with codecs.open(filepath, 'r', 'utf-8') as f:
            content = f.read()

        updates = fetch_latest_schedule()
        
        if not updates:
            print("新しい更新情報はありませんでした。")
            return

        updated_content = content
        
        for name, data in updates.items():
            # data.js内から該当する花火大会のブロックを見つけ出す
            pattern = re.compile(r'(\{.*?name:\s*["\']' + re.escape(name) + r'["\'].*?\})', re.DOTALL)
            match = pattern.search(updated_content)
            
            if match:
                obj_str = match.group(1)
                new_obj_str = obj_str
                
                # 日付(dateStr)の書き換え
                if "dateStr" in data:
                    new_obj_str = re.sub(r'dateStr:\s*["\'].*?["\']', f'dateStr: "{data["dateStr"]}"', new_obj_str)
                
                # isEstimated(想定フラグ)の書き換え
                if "isEstimated" in data:
                    new_obj_str = re.sub(r'isEstimated:\s*(true|false)', f'isEstimated: {str(data["isEstimated"]).lower()}', new_obj_str)
                
                updated_content = updated_content.replace(obj_str, new_obj_str)
                print(f"✅ 更新成功: {name} -> 日付: {data.get('dateStr')}, 想定マーク解除: {not data.get('isEstimated')}")
        
        # 変更があれば保存
        if updated_content != content:
            with codecs.open(filepath, 'w', 'utf-8') as f:
                f.write(updated_content)
            print("■ data.js を上書き保存しました！(この後Webサイトへ自動反映されます)")
        else:
            print("変更箇所はありませんでした。")
            
    except Exception as e:
        print(f"エラーが発生しました: {e}")

if __name__ == "__main__":
    update_data()
