//
//  ScaleAPIService.swift
//  TrackWeight
//

import Foundation

struct ShouldWeighResponse: Codable {
    let shouldWeigh: Bool
    let measurement: MeasurementData?
}

struct MeasurementData: Codable {
    let id: Int
    let status: String
    let weight: String?
    let createdAt: String
}

struct WeightResponse: Codable {
    let measurement: MeasurementData?
}

final class ScaleAPIService: Sendable {
    static let  shared = ScaleAPIService()

    private let baseURL = "http://localhost:3000/api/scale"

    func checkShouldWeigh() async throws -> ShouldWeighResponse {
        let url = URL(string: "\(baseURL)/should-weigh")!
        let (data, _) = try await URLSession.shared.data(from: url)
        return try JSONDecoder().decode(ShouldWeighResponse.self, from: data)
    }

    func submitWeight(id: Int, weight: Float) async throws -> WeightResponse {
        let url = URL(string: "\(baseURL)/weight")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        let body: [String: Any] = ["id": id, "weight": Double(weight)]
        request.httpBody = try JSONSerialization.data(withJSONObject: body)
        let (data, _) = try await URLSession.shared.data(for: request)
        return try JSONDecoder().decode(WeightResponse.self, from: data)
    }
}
