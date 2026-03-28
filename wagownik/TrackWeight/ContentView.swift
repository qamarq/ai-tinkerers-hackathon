//
//  ContentView.swift
//  TrackWeight
//

import SwiftUI

struct ContentView: View {
    @State private var showHomePage = true
    @State private var selectedTab = 1

    var body: some View {
        Group {
            if showHomePage {
                HomeView {
                    withAnimation(.easeInOut(duration: 0.4)) {
                        showHomePage = false
                    }
                }
            } else {
                TabView(selection: $selectedTab) {
                    TrackWeightView()
                        .tabItem {
                            Image(systemName: "arrow.3.trianglepath")
                            Text("Guided")
                        }
                        .tag(0)

                    ScaleView()
                        .tabItem {
                            Image(systemName: "scalemass")
                            Text("Scale")
                        }
                        .tag(1)

                    SettingsView()
                        .tabItem {
                            Image(systemName: "gearshape")
                            Text("Settings")
                        }
                        .tag(2)
                }
                .transition(.opacity)
            }
        }
        .frame(minWidth: 700, minHeight: 500)
    }
}

#Preview {
    ContentView()
}
