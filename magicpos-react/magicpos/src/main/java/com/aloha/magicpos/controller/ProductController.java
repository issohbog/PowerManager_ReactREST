package com.aloha.magicpos.controller;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

import com.aloha.magicpos.domain.Categories;
import com.aloha.magicpos.domain.Pagination;
import com.aloha.magicpos.domain.Products;
import com.aloha.magicpos.service.CategoryService;
import com.aloha.magicpos.service.ProductService;

import jakarta.servlet.ServletContext;
import lombok.extern.slf4j.Slf4j;

@Slf4j
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


    // 전체 상품 목록
    @GetMapping("/productlist")
    public String list(Model model) throws Exception{
        List<Products> products = productService.findAll();
        model.addAttribute("products", products);
        return "product/list";
    }

    // 전체 상품 목록(관리자용)
    @GetMapping("/admin/productlist")
    public String productlist(@RequestParam(name="type", required = false) String type,
                              @RequestParam(name = "keyword", required = false) String keyword,
                              @RequestParam(name = "page", defaultValue = "1") int page,
                              @RequestParam(name = "size", defaultValue = "10") int size,
                              Model model) throws Exception{
        

        // 전체 상품 수 
        int total = productService.countProducts(type, keyword);

        // 페이지 네이션 객체 생성 
        Pagination pagination = new Pagination(page, size, 10, total);

        // 상품 목록 조회 
        List<Products> products;
        if (type != null && !type.isEmpty() && keyword != null && !keyword.isEmpty()) {
            try {
                Long categoryNo = Long.parseLong(type);
                products = productService.searchProductsforAdmin(categoryNo, keyword, (page - 1) * size, size);
            } catch (NumberFormatException e) {
                // 잘못된 type 값일 경우 전체 목록으로 fallback
                products = productService.findAllforAdmin((page - 1) * size, size);
            }
        } else {
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

        model.addAttribute("products", products);
        model.addAttribute("categoryMap", categoryMap);
        model.addAttribute("pagination", pagination);
        model.addAttribute("type", type);       // 선택한 카테고리 유지
        model.addAttribute("keyword", keyword); // 검색어 유지

        return "pages/admin/admin_product_list";
    }

    // 재고 수정 
    @PostMapping("/admin/update-stock")
    @ResponseBody
    public String updateStock(@RequestBody Map<String, Object> request) throws Exception {
        Long pNo = Long.valueOf(request.get("no").toString());
        int stock = Integer.parseInt(request.get("stock").toString());

        boolean result = productService.updateStock(pNo, stock); 
        return result ? "success" : "fail";
    }



    // 상품 등록 폼(사용 안함)
    @GetMapping("/new")
    public String form(Model model) throws Exception{
        model.addAttribute("product", new Products());
        model.addAttribute("categories", categoryService.findAll());
        return "product/form";
    }

    // 상품 등록 처리
    @PostMapping("/admin/create")
    @ResponseBody
    public String insert(@ModelAttribute Products product) throws Exception{
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
        return "ok";
    }

    // 상품 수정 폼(사용 안함)
    @GetMapping("/{no}/edit")
    public String edit(@PathVariable Long no, Model model) throws Exception{
        Products product = productService.findById(no);
        model.addAttribute("product", product);
        model.addAttribute("categories", categoryService.findAll());
        return "product/form";
    }

    // 상품 수정 처리
    @PostMapping("/admin/update")
    @ResponseBody
    public String updateProduct(@ModelAttribute Products product,
                                @RequestParam(value = "imageFile", required = false) MultipartFile imageFile) throws Exception {
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
        productService.update(product);

        return "success";
    }


    // 단건 상품 삭제
    @PostMapping("/admin/{no}/delete")
    @ResponseBody
    public ResponseEntity<String> delete(@PathVariable("no") Long no) throws Exception {
        productService.delete(no);
        return ResponseEntity.ok("ok");
    }

    // 체크된 상품 모두 삭제 
    @PostMapping("/admin/deleteAll")
    @ResponseBody
    public ResponseEntity<String> deleteAll(@RequestParam("productNos") List<Long> userNos) throws Exception {
        for (Long no : userNos) {
            productService.delete(no);
        }
        return ResponseEntity.ok("ok");
    }


    // 🔍 상품 검색 (통합 검색) (사용안함)
    @GetMapping("/search")
    public String search(@RequestParam String keyword, Model model) throws Exception {
        List<Products> products = productService.searchProductsAll(keyword);
        model.addAttribute("products", products);
        return "product/list";
    }

    // 🔍 상품 검색 + 분류 필터 (사용안함)
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
