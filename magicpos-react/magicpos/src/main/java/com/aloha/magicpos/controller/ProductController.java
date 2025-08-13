package com.aloha.magicpos.controller;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.aloha.magicpos.domain.Categories;
import com.aloha.magicpos.domain.Pagination;
import com.aloha.magicpos.domain.Products;
import com.aloha.magicpos.service.CategoryService;
import com.aloha.magicpos.service.ProductService;

import jakarta.servlet.ServletContext;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@Controller
@RequestMapping("/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private ServletContext servletContext;

    @Value("${file.upload-dir}")
    private String uploadDir;               // application.properties에서 주입받음


    // 전체 상품 목록                       // 안쓰는 것 같음 - REST 구현 완료 후 삭제 예정
    @GetMapping("/productlist")
    public String list(Model model) throws Exception{
        List<Products> products = productService.findAll();
        model.addAttribute("products", products);
        return "product/list";
    }

    // 전체 상품 목록(관리자용)
    @GetMapping("/admin/productlist")
    public ResponseEntity<Map<String, Object>> productlist(
                              @RequestParam(name="type", required = false) String type,
                              @RequestParam(name = "keyword", required = false) String keyword,
                              @RequestParam(name = "page", defaultValue = "1") int page,
                              @RequestParam(name = "size", defaultValue = "10") int size) throws Exception{


        // 전체 상품 수 
        int total = productService.countProducts(type, keyword);

        // 페이지 네이션 객체 생성 
        Pagination pagination = new Pagination(page, size, 10, total);

        // 상품 목록 조회 
        List<Products> products;
        if ((type == null || type.isEmpty()) && (keyword != null && !keyword.isEmpty())) {
            // 카테고리가 없고 검색어만 있을 때
            log.info("searchProductsforAdmin 호출");
            log.info("카테고리 없음, 검색어: {}", keyword);
            products = productService.searchProductsforAdmin(null, keyword, (page - 1) * size, size);
        } else if (type != null && !type.isEmpty()) {
            try {
                Long categoryNo = Long.parseLong(type);
                if (keyword != null && !keyword.isEmpty()) {
                    log.info("searchProductsforAdmin 호출");
                    log.info("카테고리 번호: {}, 검색어: {}", categoryNo, keyword);
                    products = productService.searchProductsforAdmin(categoryNo, keyword, (page - 1) * size, size);
                } else {
                    log.info("카테고리 번호: {}", categoryNo);
                    log.info("findProductsByCategory 호출");
                    products = productService.findProductsByCategory(categoryNo, (page - 1) * size, size);
                    log.info("조회된 상품 : {}", products.toString());
                }
            } catch (NumberFormatException e) {
                // 잘못된 type 값일 경우 전체 목록으로 fallback
                log.info("findAllforAdmin 호출");
                products = productService.findAllforAdmin((page - 1) * size, size);
            }
        } else {
            log.info("findAllforAdmin 호출");
            products = productService.findAllforAdmin((page - 1) * size, size);
        }

        List<Categories> categories = categoryService.findAll();

        // 오늘 판매량 Map<p_no, quantity>
        Map<Long, Long> todaySalesMap = productService.findTodaySalesMap();
        // 상품에 금일 판매량 주입
        for (Products product : products) {
            Long sales = todaySalesMap.getOrDefault(product.getNo(), 0L);
            product.setTodaySales(sales);
        }

        // List<Categories>를 MCategories 객체들을 카테고리번호(no)를 키, 카테고리이름(cName)을 값으로 해서 
        // Map<번호, 이름> 형태로 변환
        Map<Long, String> categoryMap = categories.stream()
                    .collect(Collectors.toMap(Categories:: getNo, Categories::getCName));
        Map<String, Object> result = new HashMap<>();
        
        result.put("products", products);
        result.put("categoryMap", categoryMap);
        result.put("pagination", pagination);
        result.put("type", type);               // 선택한 카테고리 유지
        result.put("keyword", keyword);         // 검색어 유지


        return ResponseEntity.ok(result);
    }

    // 재고 수정                                // REST 구현 완료 후 추가 기능 구현 시 실행 예정
    @PostMapping("/admin/update-stock")
    @ResponseBody
    public String updateStock(@RequestBody Map<String, Object> request) throws Exception {
        Long pNo = Long.valueOf(request.get("no").toString());
        int stock = Integer.parseInt(request.get("stock").toString());

        boolean result = productService.updateStock(pNo, stock); 
        return result ? "success" : "fail";
    }



    // 상품 등록 폼(사용 안함)                                // 안쓰는 것 같음 - REST 구현 완료 후 삭제 예정   
    @GetMapping("/new")
    public String form(Model model) throws Exception{
        model.addAttribute("product", new Products());
        model.addAttribute("categories", categoryService.findAll());
        return "product/form";
    }

    // 상품 등록 처리
    @PostMapping(value ="/admin/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> insert(@ModelAttribute Products product) throws Exception{
        log.info("상품 등록 요청: {}", product);

        Map<String, Object> result = new HashMap<>();

         // 이미지 저장 처리
        MultipartFile file = product.getImageFile();

        if (file != null && !file.isEmpty()) {
            // 확장자 추출 
            String ext = file.getOriginalFilename()
                             .substring(file.getOriginalFilename().lastIndexOf("."));
            String fileName = UUID.randomUUID() + ext;

            // 폴더 없으면 자동 생성
            File dir = new File(uploadDir);
            if (!dir.exists()) {
                boolean created = dir.mkdirs(); // 상위 폴더까지 생성
                if (!created) {
                    throw new IOException("업로드 디렉토리 생성 실패: " + uploadDir);
                }
            }

            // 실제 파일 저장 
            File saveFile = new File(dir, fileName);
            file.transferTo(saveFile);

            // db에는 브라우저에서 접근 가능한 경로 저장 
            String dbPath = "/upload/images/products/" + fileName;
            product.setImgPath(dbPath); // DB에 저장할 이미지 경로
        }

        // 재고 기본값
        product.setStock(0L);

        // 서비스에 저장
        productService.insert(product);
        result.put("status", "success");
        result.put("message", "상품이 성공적으로 등록되었습니다.");
        return ResponseEntity.ok(result);
    }

    // 상품 수정 폼(사용 안함)                                  // 안쓰는 것 같음 - REST 구현 완료 후 삭제 예정
    @GetMapping("/{no}/edit")
    public String edit(@PathVariable Long no, Model model) throws Exception{
        Products product = productService.findById(no);
        model.addAttribute("product", product);
        model.addAttribute("categories", categoryService.findAll());
        return "product/form";
    }

    // 상품 수정 처리
    @PutMapping(value = "/admin/update", consumes = "multipart/form-data")
    public ResponseEntity<Map<String, Object>> updateProduct(
                                @ModelAttribute Products product,
                                @RequestParam(value = "imageFile", required = false) MultipartFile imageFile) throws Exception {
        
                                    
        Map<String, Object> result = new HashMap<>();
        
        // 1. 기존 상품 정보 조회 (기존 이미지 경로 얻기 위해)
        Products existingProduct = productService.findById(product.getNo());

        // 2. 이미지 파일 새로 업로드한 경우
        if (imageFile != null && !imageFile.isEmpty()) {
            // 확장자 추출
            String ext = imageFile.getOriginalFilename()
                                .substring(imageFile.getOriginalFilename().lastIndexOf("."));
            String fileName = UUID.randomUUID() + ext;

            // 저장 경로 생성
            File dir = new File("C:/PMupload/images/products/");
            if (!dir.exists()) {
                boolean created = dir.mkdirs();
                if (!created) {
                    throw new IOException("업로드 디렉토리 생성 실패");
                }
            }

            // 실제 파일 저장
            File saveFile = new File(dir, fileName);
            imageFile.transferTo(saveFile);

            // 브라우저 접근 가능한 경로로 저장
            String dbPath = "/upload/images/products/" + fileName;
            product.setImgPath(dbPath);
        } else {
            // 이미지 안 바꾼 경우 기존 이미지 경로 유지
            product.setImgPath(existingProduct.getImgPath());
        }

        // 3. DB 업데이트
        boolean isUpdated = productService.update(product);

        if (isUpdated) {
            result.put("status", "success");
            result.put("message", "상품 정보가 성공적으로 업데이트되었습니다.");
        } else {
            result.put("status", "fail");
            result.put("message", "해당 상품이 존재하지 않아 수정되지 않았습니다.");
        }

        return ResponseEntity.ok(result);
    }


    // 단건 상품 삭제
    @DeleteMapping("/admin/{no}/delete")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable("no") Long no) throws Exception {
        Map<String, Object> result = new HashMap<>();
        try {
            productService.delete(no);
            result.put("success", true);
            result.put("message", "상품이 삭제되었습니다.");
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "상품 삭제에 실패했습니다.");
        }
        return ResponseEntity.ok(result);
    }

    // 체크된 상품 모두 삭제 
    @DeleteMapping("/admin/deleteAll")
    public ResponseEntity<Map<String, Object>> deleteAll(@RequestBody List<Long> productNos) throws Exception {
        Map<String, Object> result = new HashMap<>();
        try {
            for (Long no : productNos) {
                productService.delete(no);
            }
            result.put("success", true);
            result.put("message", "선택한 상품이 삭제되었습니다.");
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "상품 삭제에 실패했습니다.");
        }
        return ResponseEntity.ok(result);
    }


    // 🔍 상품 검색 (통합 검색) (사용안함)                          // REST 구현 완료 후 추가 기능 구현 시 실행 예정
    @GetMapping("/search")
    public String search(@RequestParam String keyword, Model model) throws Exception {
        List<Products> products = productService.searchProductsAll(keyword);
        model.addAttribute("products", products);
        return "product/list";
    }

    // 🔍 상품 검색 + 분류 필터 (사용안함)                          // REST 구현 완료 후 추가 기능 구현 시 실행 예정           
    @GetMapping("/filter")
    public String filter(@RequestParam("cNo") long cNo,
                         @RequestParam("keyword") String keyword,
                         Model model)
        throws Exception {
        List<Products> products = productService.searchProducts(cNo, keyword);
        model.addAttribute("products", products);
        return "product/list";
    }
}
